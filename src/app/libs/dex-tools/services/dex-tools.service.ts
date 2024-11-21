import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { firstValueFrom } from "rxjs";
import { Repository } from "typeorm";

import { DateService } from "../../date";
import type { IDate } from "../../date/interfaces/date.interface";
import { LoggerService } from "../../logger";
import { DEX_TOOLS_PERIODS } from "../constant/dex-tools-periods.constant";
import { FAKE_HEADERS } from "../constant/fake-headers";
import { DexToolsCandleEntity } from "../entities/dex-tools-candle.entity";
import { DexToolsPairEntity } from "../entities/dex-tools-pair.entity";
import type { IDexToolCandle } from "../interfaces/dex-tools-candle.interface";
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
		@InjectRepository(DexToolsCandleEntity)
		private readonly _dexToolsCandlesRepository: Repository<DexToolsCandleEntity>,
		@InjectRepository(DexToolsPairEntity)
		private readonly _dexToolsPairsRepository: Repository<DexToolsPairEntity>,
		private readonly _dexToolsUtilsService: DexToolsUtilsService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService
	) {}

	async getCandles(pairId: string, chain: string, date: IDate, period: IDexToolsPeriod = this._defaultPeriod) {
		const cacheKey = [pairId, chain, date.unix().toString(), period].filter(Boolean).join("-");
		const cachedData = await this._dexToolsCandlesRepository.findOneBy({ name: cacheKey });

		if (cachedData) {
			return cachedData.data.map((candle) => this._dexToolsUtilsService.convertCandle(candle));
		}

		try {
			const baseUrl = chain === "avalanche" ? this._apiUrls.old : this._apiUrls.core;
			const url = `${baseUrl}/pool/candles/${chain}/${pairId}/${period}?ts=${date.unix()}&tz=0`;
			const { data } = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));

			const candles: IDexToolCandle[] = (data.data?.candles || []).sort((a, b) => a.firstTimestamp - b.lastTimestamp);

			if (candles.length === 0) {
				return [];
			}

			if (this._dateService.isPast(date)) {
				await this._dexToolsCandlesRepository.save({ name: cacheKey, data: candles });
			}

			return candles.map((candle) => this._dexToolsUtilsService.convertCandle(candle));
		} catch (error) {
			this._loggerService.error("getCandles failed:", error?.response?.data);
			return [];
		}
	}

	async searchPair(query: string, tokenAddress?: string) {
		const cacheKey = [query, tokenAddress || ""].filter(Boolean).join("-");
		const cachedData = await this._dexToolsPairsRepository.findOneBy({ name: cacheKey });

		if (cachedData) {
			return this._dexToolsUtilsService.convertPair(cachedData.data);
		}

		try {
			const url = `${this._apiUrls.shared}/search/pair?query=${query.toLowerCase()}`;
			const response = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));

			const pairs = response.data?.results || [];
			const filteredPairs = tokenAddress ? pairs.filter((pair) => pair.id.token === tokenAddress) : pairs;
			const sortedPairs = filteredPairs.sort((a, b) => b.metrics.liquidity - a.metrics.liquidity);
			const [bestPair] = sortedPairs;

			if (!bestPair) {
				return;
			}

			await this._dexToolsPairsRepository.save({ name: cacheKey, data: bestPair });

			return this._dexToolsUtilsService.convertPair(bestPair);
		} catch (error) {
			this._loggerService.error("searchPair failed:", error?.response?.data);
			return null;
		}
	}

	async getPair(pairId: string, chain: string) {
		const cacheKey = [pairId, chain].join("-");
		const cachedData = await this._dexToolsPairsRepository.findOneBy({ name: cacheKey });

		if (cachedData) {
			return this._dexToolsUtilsService.convertPair(cachedData.data);
		}

		const url = `${this._apiUrls.shared}/data/pair?address=${pairId}&chain=${chain}`;

		try {
			const response = await firstValueFrom(this._httpService.get(url, { headers: FAKE_HEADERS }));
			const [pair] = response.data?.data;

			if (!pair) {
				return;
			}

			await this._dexToolsPairsRepository.save({ name: cacheKey, data: pair });

			return this._dexToolsUtilsService.convertPair(pair);
		} catch (error) {
			this._loggerService.error("getPair failed:", error?.response?.data);
			return null;
		}
	}
}
