import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";
import { COIN_GECKO_CONFIG } from "../injection-tokens/coin-gecko-config.injection-token";
import { ICoinGeckoConfig } from "../interfaces/coin-gecko-config.interface";

@Injectable()
export class CoinGeckoService {
	private readonly _apiUrl = "https://api.coingecko.com/api/v3";

	constructor(
		@Inject(COIN_GECKO_CONFIG) private readonly coinGeckoConfig: ICoinGeckoConfig,
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	async getMarketChartRange(address: string, vsCurrency: string, from: number, to: number) {
		try {
			const id = await this.getIdByAddress(address);

			const res$ = this._httpService.get(`${this._apiUrl}/coins/${id}/market_chart/range`, {
				params: {
					vs_currency: vsCurrency,
					from,
					to
				}
			});

			const res = await lastValueFrom(res$);
			return res.data.prices;
		} catch (error) {
			this._loggerService.error("getMarketChartRange", error?.response?.data);
			return null;
		}
	}

	// Пример метода для получения ID токена по адресу
	private async getIdByAddress(address: string) {
		// Ваш код для получения ID на основе адреса
		return "id"; // Вернуть соответствующий ID
	}

	async getTokenPriceByDate(coinAddress: string, date: Date) {
		const formattedDate = date.toISOString().split("T")[0];

		const res$ = this._httpService.get(`${this._apiUrl}/coins/${coinAddress}/history`, {
			params: {
				date: formattedDate,
				localization: "false"
			},
			headers: {
				"Content-Type": "application/json"
			}
		});

		return lastValueFrom(res$);
	}
}
