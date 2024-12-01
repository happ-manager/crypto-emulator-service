import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";

@Injectable()
export class NomicsService {
	private readonly _apiUrl = "https://api.nomics.com/v1";

	constructor(
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	async getCandles(address: string, interval: string, start: string, end: string) {
		try {
			const market = await this.getMarketByAddress(address);

			const res$ = this._httpService.get(`${this._apiUrl}/candles`, {
				params: {
					key: process.env.NOMICS_API_KEY,
					market,
					interval,
					start,
					end
				}
			});

			const res = await lastValueFrom(res$);
			return res.data;
		} catch (error) {
			this._loggerService.error("getCandles", error?.response?.data);
			return null;
		}
	}

	// Пример метода для получения рынка по адресу
	private async getMarketByAddress(address: string) {
		// Ваш код для получения рынка на основе адреса
		return "MARKET"; // Вернуть соответствующий рынок
	}
}
