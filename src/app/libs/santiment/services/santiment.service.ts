import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";

@Injectable()
export class SantimentService {
	private readonly _apiUrl = "https://api.santiment.net";

	constructor(
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	async getOHLC(address: string, from: string, to: string, interval: string) {
		try {
			const slug = await this.getSlugByAddress(address);

			const res$ = this._httpService.get(`${this._apiUrl}/ohlc`, {
				params: {
					slug,
					from,
					to,
					interval
				}
			});

			const res = await lastValueFrom(res$);
			return res.data;
		} catch (error) {
			this._loggerService.error("getOHLC", error?.response?.data);
			return null;
		}
	}

	// Пример метода для получения slug токена по адресу
	private async getSlugByAddress(address: string) {
		// Ваш код для получения slug на основе адреса
		return "SLUG"; // Вернуть соответствующий slug
	}
}
