import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";

@Injectable()
export class MessariService {
	private readonly _apiUrl = "https://data.messari.io/api/v1";

	constructor(
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	async getOHLCV(address: string, interval: string, start: string, end: string) {
		try {
			const asset = await this.getAssetByAddress(address);

			const res$ = this._httpService.get(`${this._apiUrl}/assets/${asset}/metrics/market-data/ohlcv/intervals`, {
				params: {
					interval,
					start,
					end
				}
			});

			const res = await lastValueFrom(res$);
			return res.data.data;
		} catch (error) {
			this._loggerService.error(error?.response?.data, "getOHLCV");
			return null;
		}
	}

	// Пример метода для получения ID актива по адресу
	private async getAssetByAddress(address: string) {
		// Ваш код для получения актива на основе адреса
		return "ASSET"; // Вернуть соответствующий ID актива
	}
}
