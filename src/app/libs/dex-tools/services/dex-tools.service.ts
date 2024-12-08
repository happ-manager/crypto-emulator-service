import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

import { DateService } from "../../date";
import type { IDate } from "../../date/interfaces/date.interface";
import { LoggerService } from "../../logger";
import { DEX_TOOLS_PERIODS } from "../constant/dex-tools-periods.constant";
import { FAKE_HEADERS } from "../constant/fake-headers";
import type { IDexToolCandle } from "../interfaces/dex-tools-candle.interface";
import type { IDexToolPair } from "../interfaces/dex-tools-pair.interface";
import type { IDexToolsPeriod } from "../interfaces/dex-tools-period.interface";
import { DexToolsUtilsService } from "./dex-tools-utils.service";

@Injectable()
export class DexToolsService {
	private readonly _apiUrls = {
		shared: "https://www.dextools.io/shared",
		core: "https://core-api.dextools.io",
		old: "https://www.dextools.io"
	};

	private readonly _defaultPeriod = DEX_TOOLS_PERIODS.FIVE_MINUTES_FROM_WEEK;

	constructor(
		private readonly _httpService: HttpService,
		private readonly _dexToolsUtilsService: DexToolsUtilsService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService
	) {}

	async getCandles(pairId: string, chain: string, date: IDate, period: IDexToolsPeriod = this._defaultPeriod) {
		try {
			const baseUrl = chain === "avalanche" ? this._apiUrls.old : this._apiUrls.core;
			const url = `${baseUrl}/pool/candles/${chain}/${pairId}/${period}?ts=${date.unix()}&tz=0`;
			const { data } = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));

			const candles: IDexToolCandle[] = (data.data?.candles || []).sort((a, b) => a.firstTimestamp - b.lastTimestamp);

			if (candles.length === 0) {
				return [];
			}

			return candles.map((candle) => this._dexToolsUtilsService.convertCandle(candle));
		} catch (error) {
			this._loggerService.error(error?.response?.data, "getCandles");
			return [];
		}
	}

	async searchPair(query: string) {
		try {
			const url = `${this._apiUrls.shared}/search/pair?query=${query.toLowerCase()}`;
			const response = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));

			const pairs: IDexToolPair[] = response?.data?.results || [];

			return pairs.map((pair) => this._dexToolsUtilsService.convertPair(pair));
		} catch (error) {
			this._loggerService.error(error?.response?.data, "searchPair");
			return null;
		}
	}

	async getPair(pairId: string, chain: string) {
		const url = `${this._apiUrls.shared}/data/pair?address=${pairId}&chain=${chain}`;

		try {
			const response = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));
			const [pair] = response.data?.data;

			if (!pair) {
				return;
			}

			return this._dexToolsUtilsService.convertPair(pair);
		} catch (error) {
			this._loggerService.error(error?.response?.data, "getPair");
			return null;
		}
	}
}
