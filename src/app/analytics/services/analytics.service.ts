import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import { DexToolsService } from "../../libs/dex-tools";
import type { IDexToolCandle } from "../../libs/dex-tools/interfaces/dex-tools-candle.interface";
import { DexToolsUtilsService } from "../../libs/dex-tools/services/dex-tools-utils.service";
import { LoggerService } from "../../libs/logger";
import { getPercentDiff } from "../../shared/utils/get-percent-diff.util";
import { sleep } from "../../shared/utils/sleep.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _dexToolsService: DexToolsService,
		private readonly _dexToolsUtilsService: DexToolsUtilsService,
		private readonly _loggerService: LoggerService
	) {}

	async analyse(signals: ISignal[], sources: string[]) {
		const signalsWhere = signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : { source: In(sources) };

		const findedSignals = await this._signalsService.getSignals({
			where: { ...signalsWhere, token: { dexToolsPairId: Not(IsNull()) } },
			take: 1000,
			relations: ["token"]
		});

		const results = [];

		for (const [index, signal] of findedSignals.data.entries()) {
			await sleep(100);
			this._loggerService.log(`Fetch page #${index + 1} of ${findedSignals.data.length}`);
			const { dexToolsPairId, chain } = signal.token;
			const pair = await this._dexToolsService.getPair(dexToolsPairId, chain);

			const period = this._dexToolsUtilsService.getPeriod(pair.creationTime);
			const adjustedDate = this._dexToolsUtilsService.getAdjustedDate(period, signal.signaledAt);

			const candles = await this._dexToolsService.getCandles(dexToolsPairId, chain, adjustedDate, period);
			const entryCandle = this._dexToolsUtilsService.getCandle(candles, signal.signaledAt);
			const [firstCandle] = candles;
			const lastCandle = candles.at(-1);

			if (!entryCandle) {
				results.push({
					signal,
					entryCandle: {},
					firstCandle: {},
					lastCandle: {},
					percentCandles: {},
					minCandle: {},
					maxCandle: {}
				});
				continue;
			}

			const maxCandle = candles.reduce((max, candle) => (candle.high > max.high ? candle : max), entryCandle);
			const candlesBeforeMax = candles.slice(0, candles.indexOf(maxCandle) + 1);
			const minCandle = candlesBeforeMax.reduce((min, candle) => (candle.low < min.low ? candle : min), maxCandle);

			const minPercent = getPercentDiff(entryCandle.open, minCandle.low);
			const maxPercent = getPercentDiff(entryCandle.open, maxCandle.high);

			const percentCandles: Record<string, IDexToolCandle | null> = {};

			const candlesFromMin = [...candlesBeforeMax].sort((a, b) => a.low - b.low);
			const candlesFromMax = [...candlesBeforeMax].sort((a, b) => b.high - a.high);

			for (let percent = Math.floor(minPercent); percent <= Math.floor(maxPercent); percent++) {
				const price = (entryCandle.open * percent) / 100;

				percentCandles[`${percent}`] =
					percent > 0
						? candlesFromMax.find((candle) => price < candle.high)
						: candlesFromMin.find((candle) => price < candle.low);
			}

			results.push({
				signal,
				entryCandle,
				maxCandle,
				minCandle,
				firstCandle,
				lastCandle,
				percentCandles
			});
		}

		return results;
	}
}
