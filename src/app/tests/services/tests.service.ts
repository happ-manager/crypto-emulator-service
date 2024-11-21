import { Injectable } from "@nestjs/common";

import type { IDate } from "../../libs/date/interfaces/date.interface";
import { DexToolsService } from "../../libs/dex-tools";
import type { IDexToolsPeriod } from "../../libs/dex-tools/interfaces/dex-tools-period.interface";

@Injectable()
export class TestsService {
	constructor(private readonly _dexToolsService: DexToolsService) {}

	getCandles(pairId: string, chain: string, date?: IDate, period?: IDexToolsPeriod) {
		return this._dexToolsService.getCandles(pairId, chain, date, period);
	}

	async getFormatedCandles(pairId: string, chain: string, date?: IDate, period?: IDexToolsPeriod) {
		const candles = await this._dexToolsService.getCandles(pairId, chain, date, period);

		return candles.map((candle) => ({
			firstTimestamp: candle.firstTimestamp.format(),
			lastTimestamp: candle.lastTimestamp.format(),
			time: candle.time.format(),
			ts: candle.ts.format()
		}));
	}
}
