import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";

@Injectable()
export class CryptoCompareService {
	private readonly _apiUrl = "https://min-api.cryptocompare.com/data";

	constructor(
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	async getHistoricalData(address: string, tsym: string, limit: number, aggregate: number) {
		try {
			// Здесь предполагается, что адрес токена можно конвертировать в символ через ваш сервис или БД.
			const symbol = await this.getSymbolByAddress(address);

			const res$ = this._httpService.get(`${this._apiUrl}/v2/histominute`, {
				params: {
					fsym: symbol,
					tsym,
					limit,
					aggregate
				}
			});

			const res = await lastValueFrom(res$);
			return res.data.Data;
		} catch (error) {
			this._loggerService.error("getHistoricalData", error?.response?.data);
			return null;
		}
	}

	// Пример метода для получения символа токена по адресу
	private async getSymbolByAddress(address: string): Promise<string> {
		// Ваш код для получения символа на основе адреса
		return "SYMBOL"; // Вернуть соответствующий символ
	}
}
