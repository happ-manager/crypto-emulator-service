import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";
import { In } from "typeorm";
import { v4 } from "uuid";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { CryptoService } from "../../libs/crypto";
import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import { SolanaPriceService } from "../../libs/solana";
import { SubscribtionTypeEnum } from "../../libs/solana/enums/subscribtion-type.enum";
import type { ISolanaTransaction } from "../../libs/solana/interfaces/solana-transaction.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { TradingTokenStatusEnum } from "../enums/trading-token-status.enum";
import type { IStrategyResponse } from "../interfaces/strategy-response.interface";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingStrategiesService } from "./trading-strategies.service";
import { TradingTokensService } from "./trading-tokens.service";
import { TradingsService } from "./tradings.service";

@Injectable()
export class TradingService implements OnModuleInit {
	private readonly _tradingRelations = ["sourceWallet", "targetWallet", "strategy"];

	private readonly transactions: Record<string, ISolanaTransaction[]> = {};
	private readonly boughtTransactions: Record<string, ISolanaTransaction> = {};
	private readonly soldTransactions: Record<string, ISolanaTransaction> = {};
	private readonly initialTransactions: Record<string, ISolanaTransaction> = {};
	private readonly strategies: Record<string, IStrategyResponse> = {};

	constructor(
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _tradingsService: TradingsService,
		private readonly _tradingTokensService: TradingTokensService,
		private readonly _eventsService: EventsService,
		private readonly _tradingStrategiesService: TradingStrategiesService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService,
		private readonly _cryptoService: CryptoService
	) {}

	onModuleInit() {
		return;
		setTimeout(this.init.bind(this), 2000);
	}

	async init() {
		const tradings = await this._tradingsService.getTradings({
			where: { disabled: false },
			relations: this._tradingRelations
		});
		const tradingsIds = tradings.data.map((trading) => trading.id);

		const tradingTokens = await this._tradingTokensService.getTradingTokens({
			where: { trading: In(tradingsIds) }
		});

		for (const tradingToken of tradingTokens.data) {
			this.transactions[tradingToken.poolAddress] = [];
			// this.subscribeOnPriceChanges(tradingToken);
		}

		for (const trading of tradings.data) {
			await this.start(trading.id);
		}
	}

	async setInitialTransaction(transaction: ISolanaTransaction, tradingTokenId: string) {
		const { poolAddress, walletAddress } = transaction;
		const maxDuration = 60 * 1000; // Ограничение в одну минуту
		const retryDelay = 5000; // Интервал между попытками (5 секунд)
		const startTime = Date.now();

		while (Date.now() - startTime < maxDuration) {
			const result = await lastValueFrom(this._solanaService.getTransactions(poolAddress));

			if (result.data && result.data.length > 0) {
				// Извлечение и обработка данных
				for (const transaction of result.data) {
					if (transaction.type !== "SWAP" || transaction.tokenTransfers.length > 2) {
						continue;
					}

					const prices = transaction.tokenTransfers.map((tokenTransfer) => tokenTransfer.tokenAmount);
					const price = this._solanaPriceService.computeMemeTokenPrice(prices, true);

					this.initialTransactions[poolAddress] = {
						price,
						poolAddress,
						walletAddress,
						date: this._dateService.unix(transaction.timestamp),
						signature: transaction.signature
					};

					break;
				}
			}

			await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Ожидаем перед повторной попыткой
		}

		const initialTransaction = this.initialTransactions[poolAddress];

		if (!initialTransaction) {
			return;
		}

		try {
			await this._tradingTokensService.updateTradingToken(tradingTokenId, {
				initialPrice: initialTransaction.price,
				initialAt: initialTransaction.date
			});
		} catch (error) {
			this._loggerService.error(`Cannot save initial price for ${tradingTokenId}:`, error);
		}
	}

	async start(id: string) {
		const findedTrading = await this._tradingsService.getTrading({ where: { id }, relations: this._tradingRelations });

		if (!findedTrading) {
			return;
		}

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: false });

		this._solanaService
			.on(findedTrading.targetWallet.address, SubscribtionTypeEnum.BUY)
			.subscribe(async (transaction) => {
				if (this.transactions[transaction.poolAddress]) {
					return;
				}

				const tradingTokenId = v4();
				this.transactions[transaction.poolAddress] = [transaction];

				this.setInitialTransaction(transaction, tradingTokenId).then();

				const tradingToken = {
					id: tradingTokenId,
					signaledPrice: transaction.price,
					signaledAt: transaction.date,
					walletAddress: transaction.walletAddress,
					poolAddress: transaction.poolAddress,
					status: TradingTokenStatusEnum.SIGNALED,
					trading: findedTrading
				} as any as ITradingToken;

				this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION, transaction);

				this.subscribeOnPriceChanges(tradingToken, findedTrading);

				await this._tradingTokensService.createTradingToken(tradingToken);
			});
	}

	async stop(id: string) {
		const findedTrading = await this._tradingsService.getTrading({
			where: { id },
			relations: [...this._tradingRelations, "tradingTokens"]
		});

		if (!findedTrading) {
			return;
		}

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: true });

		const poolAddresses = (findedTrading.tradingTokens || []).map((tradingToken) => tradingToken.poolAddress);

		this._solanaService.unsubscribe([findedTrading.targetWallet.address, ...poolAddresses]);
	}

	subscribeOnPriceChanges(tradingToken: ITradingToken, trading: ITrading) {
		if (!this.transactions[tradingToken.poolAddress]) {
			return;
		}

		let [signalTransaction] = this.transactions[tradingToken.poolAddress];
		let enterTransaction: ISolanaTransaction;
		let exitTransaction: ISolanaTransaction;

		if (!signalTransaction && tradingToken.signaledPrice && tradingToken.signaledAt) {
			signalTransaction = {
				date: tradingToken.signaledAt,
				price: tradingToken.signaledPrice,
				poolAddress: tradingToken.poolAddress,
				walletAddress: tradingToken.walletAddress
			};
		}

		if (tradingToken.enterPrice && tradingToken.enterAt) {
			enterTransaction = {
				date: tradingToken.enterAt,
				price: tradingToken.enterPrice,
				poolAddress: tradingToken.poolAddress
			};
		}

		if (tradingToken.exitPrice && tradingToken.exitAt) {
			exitTransaction = {
				date: tradingToken.exitAt,
				price: tradingToken.exitPrice,
				poolAddress: tradingToken.poolAddress
			};

			return;
		}

		this._solanaService.on(tradingToken.poolAddress, SubscribtionTypeEnum.PRICE).subscribe(async (transaction) => {
			this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION, transaction);

			const transactions = this.transactions[transaction.poolAddress];
			const initialTransaction = this.initialTransactions[transaction.poolAddress];

			const isExpired = this._dateService.now().diff(signalTransaction.date, "minute") > 15;

			if (isExpired && !enterTransaction) {
				this._solanaService.unsubscribe([transaction.poolAddress]);
				return;
			}

			transactions.push(transaction);

			const isMe = (transaction.authories || []).includes(trading.sourceWallet.address);

			if (isMe) {
				let message: string;
				let event: EventsEnum;

				if (!enterTransaction && this.boughtTransactions[transaction.poolAddress]) {
					enterTransaction = transaction;
					message = `Купили ${enterTransaction.poolAddress} по цене ${enterTransaction.price}$. Дата: ${enterTransaction.date.format()}`;
					event = EventsEnum.TOKEN_BOUGHT;
				}

				if (!exitTransaction && this.soldTransactions[transaction.poolAddress]) {
					exitTransaction = transaction;
					message = `Продали ${exitTransaction.poolAddress} по цене ${exitTransaction.price}$. Дата: ${exitTransaction.date.format()}`;
					event = EventsEnum.TOKEN_SELLED;
					this._solanaService.unsubscribe([exitTransaction.poolAddress]);
				}

				if (!message || !event) {
					return;
				}

				this._loggerService.log(message);
				this._eventsService.emit(event, message);
				return this._tradingTokensService.updateTradingToken(tradingToken.id, {
					...(enterTransaction
						? {
								enterPrice: `${enterTransaction.price}`,
								enterAt: enterTransaction.date
							}
						: {}),
					...(exitTransaction
						? {
								exitPrice: `${exitTransaction.price}`,
								exitAt: exitTransaction.date
							}
						: {}),
					status: exitTransaction
						? TradingTokenStatusEnum.SELLED
						: enterTransaction
							? TradingTokenStatusEnum.BOUGHT
							: TradingTokenStatusEnum.SIGNALED
				});
			}

			if (!enterTransaction && !this.boughtTransactions[transaction.poolAddress]) {
				const strategy = this._tradingStrategiesService[trading.strategy.name](transactions, initialTransaction);

				if (!strategy) {
					return;
				}

				this._loggerService.log(`Начали покупку: ${transaction.poolAddress}`);

				this.strategies[transaction.poolAddress] = strategy;
				this.boughtTransactions[transaction.poolAddress] = transaction;

				return this.buy(transaction.poolAddress, trading.price, trading.sourceWallet.secret);
			}

			if (enterTransaction && !exitTransaction && !this.soldTransactions[transaction.poolAddress]) {
				const isCheck = this.checkExit(transaction, enterTransaction);

				if (!isCheck) {
					return;
				}

				this._loggerService.log(`Начали продажу: ${transaction.poolAddress}`);

				this.soldTransactions[transaction.poolAddress] = transaction;

				return this.sell(transaction.poolAddress, trading.sourceWallet.secret);
			}
		});
	}

	checkExit(transaction: ISolanaTransaction, enterTransaction: ISolanaTransaction) {
		const { minPrice, maxPercent, minDuration } = this.strategies[transaction.poolAddress];

		const enterPriceDiff = transaction.price.percentDiff(enterTransaction.price);
		const enterTimeDiff = this._dateService.now().diff(enterTransaction.date, "seconds");

		if (minPrice && transaction.price.lte(minPrice)) {
			this._loggerService.log(`Упал под ${minPrice} относительно стартовой. Цена транзакции: ${transaction.price}`);

			return true;
		}

		if (minDuration && enterTimeDiff > minDuration) {
			this._loggerService.log(`Прошло ${minDuration} секунд. Цена транзакции: ${transaction.price}`);

			return true;
		}

		if (maxPercent && enterPriceDiff.gte(maxPercent)) {
			this._loggerService.log(`Вырос на ${maxPercent}% относительно входа. Цена транзакции: ${transaction.price}`);

			return true;
		}
	}

	buy(poolAddress: string, price: IPrice, cryptedSecret: string) {
		const secret = this._cryptoService.decrypt(cryptedSecret);

		return this._solanaService.buy(poolAddress, price.toNumber(), secret);
	}

	sell(poolAddress: string, cryptedSecret: string) {
		const secret = this._cryptoService.decrypt(cryptedSecret);

		return this._solanaService.sell(poolAddress, secret);
	}
}
