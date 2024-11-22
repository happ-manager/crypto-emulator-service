import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import type { ICandle } from "../../candles/interfaces/candle.interface";
import { CandlesService } from "../../candles/services/candles.service";
import { findCandle } from "../../candles/utils/find-candle.util";
import { LoggerService } from "../../libs/logger";
import { sleep } from "../../shared/utils/sleep.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _candlesService: CandlesService,
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
			this._loggerService.log(`Fetch signal #${index + 1} of ${findedSignals.data.length}`);

			const { data } = await this._candlesService.getCandles({
				where: { poolAddress: signal.tokenAddress }
			});

			const candles = data.filter((candle) => candle.openPrice.gt(0));

			const entryCandle = findCandle(candles, signal.signaledAt);
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

			const maxCandle = candles.reduce((max, candle) => (max.maxPrice.gt(candle.maxPrice) ? max : candle), entryCandle);
			const candlesBeforeMax = candles.slice(0, candles.indexOf(maxCandle) + 1);
			const minCandle = candlesBeforeMax.reduce(
				(min, candle) => (min.minPrice.lt(candle.minPrice) ? min : candle),
				maxCandle
			);

			const minPercent = entryCandle.openPrice.percentDiff(minCandle.minPrice);
			const maxPercent = entryCandle.openPrice.percentDiff(maxCandle.maxPrice);

			const percentCandles: Record<string, ICandle | null> = {};

			const candlesFromMin = [...candlesBeforeMax].sort((a, b) => (a.minPrice.lte(b.minPrice) ? 1 : -1));
			const candlesFromMax = [...candlesBeforeMax].sort((a, b) => (a.maxPrice.gte(b.maxPrice) ? 1 : -1));

			for (let percent = minPercent.toNumber(); percent <= maxPercent.toNumber(); percent++) {
				const price = entryCandle.openPrice.percentOf(percent);

				percentCandles[percent.toString()] =
					percent > 0
						? candlesFromMax.find((candle) => candle.maxPrice.gte(price))
						: candlesFromMin.find((candle) => candle.minPrice.lte(price));
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
