import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { sleep } from "../../../shared/utils/sleep.util";
import { DateService } from "../../date";
import type { IDate } from "../../date/interfaces/date.interface";
import { LoggerService } from "../../logger";
import { SOLSCAN_CONSTANT } from "../constants/solscan.costant";
import { FAKE_HEADERS } from "../constants/solscan-fake-headers";
import { SOLSCAN_CONFIG } from "../injection-tokens/solscan-config.injection-token";
import { ISolscanConfig } from "../interfaces/solscan-config.interface";

@Injectable()
export class SolscanService {
	private readonly _apiUrl = "https://pro-api.solscan.io/v1.0";
	private readonly _apiUrl2 = "https://api-v2.solscan.io/v2";

	headers = FAKE_HEADERS;

	constructor(
		@Inject(SOLSCAN_CONFIG) private readonly _solscanConfig: ISolscanConfig,
		private readonly _httpService: HttpService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService
	) {}

	updateCookie(cookie: string) {
		this.headers.cookie = cookie;
	}

	private get _headers() {
		return {
			[SOLSCAN_CONSTANT.AUTH_HEADER]: this._solscanConfig.keyV1
		};
	}

	async getAllBalanceChanges(address: string, afterDate?: IDate) {
		let page = 1;
		let hasMoreData = true;
		const balanceChanges = [];

		do {
			await sleep(100);
			this._loggerService.log(`Fetch page #${page}`);
			const res = await this.getBalanceChanges(address, page);

			if (!res) {
				hasMoreData = false;
				continue;
			}

			const { data } = res;

			if (data && data.length > 0) {
				balanceChanges.push(...data);

				// Находим самую старую транзакцию в полученных данных
				const oldestTransaction = data.at(-1); // Предполагается, что данные отсортированы от новых к старым

				// Проверяем, что oldestTransaction существует
				if (oldestTransaction && oldestTransaction.block_time) {
					// Преобразуем block_time в объект
					const oldestTxDate = this._dateService.unix(oldestTransaction.block_time); // Предполагается, что block_time в секундах

					// Проверяем, раньше ли дата транзакции, чем afterDate
					if (afterDate && this._dateService.isBefore(oldestTxDate, afterDate)) {
						// Если да, прекращаем загрузку новых страниц
						hasMoreData = false;
					} else {
						// Иначе продолжаем загружать следующие страницы
						page++;
					}
				} else {
					hasMoreData = false;
				}
			} else {
				hasMoreData = false;
			}
		} while (hasMoreData);

		// Фильтруем транзакции, чтобы включить только те, которые не раньше afterDate
		return afterDate
			? balanceChanges.filter((tx) =>
					this._dateService.isSameOrAfter(this._dateService.formatUnix(tx.block_time), afterDate)
				)
			: balanceChanges;
	}

	async getBalanceChanges(address: string, page = 1, pageSize = 100) {
		const solanaFilter = "&exclude_token=So11111111111111111111111111111111111111111";

		try {
			const url = `${this._apiUrl2}/account/balance_change?address=${address}&page_size=${pageSize}&page=${page}${solanaFilter}`;
			const config = {
				headers: FAKE_HEADERS
			};

			const res$ = this._httpService.get(url, config);
			const res = await lastValueFrom(res$);

			return res.data;
		} catch (error) {
			this._loggerService.error("error", error.response);
		}
	}

	async getPriceHistoryInUsdt(address: string, startDate: number, endDate: number) {
		const intervalMinutes = 5;
		const startTime = this._dateService.unix(startDate).unix();
		const endTime = this._dateService.unix(endDate).unix();

		let allTransactions = [];
		let offset = 0;
		let hasMore = true;

		while (hasMore) {
			const transactions = await this.getSplTransfers(address, startTime, endTime, offset);
			if (!transactions) {
				return;
			}

			allTransactions = [...allTransactions, ...transactions];

			if (transactions.length < 50) {
				hasMore = false;
			} else {
				offset += 50;
			}
		}

		return this.calculatePriceOverTime(allTransactions, intervalMinutes);
	}

	private async getSplTransfers(address: string, startTime: number, endTime: number, offset: number) {
		try {
			const url = `${this._apiUrl}/account/splTransfers`;
			const config = {
				params: {
					account: address,
					fromTime: startTime,
					toTime: endTime,
					limit: 50,
					offset
				},
				headers: this._headers
			};

			const res$ = this._httpService.get(url, config);
			const res = await lastValueFrom(res$);

			return res.data.data;
		} catch (error) {
			this._loggerService.error("getSplTransfers", error?.response?.data);
			return null;
		}
	}

	private calculatePriceOverTime(transactions: any[], intervalMinutes: number) {
		const [firstTransaction] = transactions;
		const lastTransaction = transactions.at(-1);

		if (!firstTransaction || !lastTransaction) {
			return;
		}

		const priceData = [];
		let currentTime = this._dateService.unix(firstTransaction.blockTime).startOf("minute").toDate().getTime();
		const endTime = this._dateService.unix(lastTransaction.blockTime).endOf("minute").toDate().getTime();
		const intervalMs = intervalMinutes * 60 * 1000;

		while (currentTime <= endTime) {
			const bucket = transactions.filter((tx) => {
				const txTime = new Date(tx.blockTime * 1000).getTime();
				return txTime >= currentTime && txTime < currentTime + intervalMs;
			});

			if (bucket.length > 0) {
				const usdtTransactions = bucket.filter(
					(tx) => tx.tokenSymbol === "USDT" // Пример фильтрации для USDT
				);

				if (usdtTransactions.length > 0) {
					const [firstTx] = usdtTransactions;
					const usdtReceived = firstTx.usdtAmount; // Предполагаемый параметр
					const tokensExchanged = firstTx.tokenAmount; // Предполагаемый параметр

					const priceInUsdt = usdtReceived / tokensExchanged;

					priceData.push({ time: new Date(currentTime), priceInUsdt });
				}
			}

			currentTime += intervalMs;
		}

		return priceData;
	}
}
