import { Injectable } from "@nestjs/common";

import { DateService } from "../../date";
import type { IDate } from "../../date/interfaces/date.interface";
import { DEX_TOOLS_PERIODS } from "../constant/dex-tools-periods.constant";
import type { IDexToolCandle } from "../interfaces/dex-tools-candle.interface";
import type { IDexToolPair } from "../interfaces/dex-tools-pair.interface";
import type { IDexToolsPeriod } from "../interfaces/dex-tools-period.interface";

@Injectable()
export class DexToolsUtilsService {
	constructor(private readonly _dateService: DateService) {}

	getCandle(candles: IDexToolCandle[], date: IDate): IDexToolCandle | null {
		// Попытка найти точное совпадение
		const exactCandle = candles.find(
			(candle) =>
				this._dateService.isSameOrAfter(date, candle.firstTimestamp) &&
				this._dateService.isSameOrBefore(date, candle.lastTimestamp)
		);
		if (exactCandle) {
			return exactCandle;
		}

		// Поиск ближайшей следующей свечи
		const nextCandle = candles.find((candle) => this._dateService.isAfter(candle.firstTimestamp, date));
		if (nextCandle) {
			return nextCandle;
		}

		// Если следующая свеча отсутствует, берем ближайшую предыдущую
		return [...candles].reverse().find((candle) => this._dateService.isBefore(candle.lastTimestamp, date)) || null;
	}

	getPeriod(date: IDate) {
		return date.isBefore(this._dateService.now().subtract(3, "hours"))
			? DEX_TOOLS_PERIODS.FIVE_MINUTES_FROM_WEEK
			: DEX_TOOLS_PERIODS.ONE_SECOND_FROM_THREE_HOURS;
	}

	getAdjustedDate(period: IDexToolsPeriod, date: IDate) {
		return period === DEX_TOOLS_PERIODS.FIVE_MINUTES_FROM_WEEK
			? date.add(1, "week").subtract(1, "minute")
			: date.add(3, "hour").subtract(1, "minute");
	}

	convertPair(pair: IDexToolPair) {
		return this._dateService.convertKeysToDate(pair, [
			"creationTime",
			"firstSwapTimestamp",
			"metrics.initialLiquidityUpdatedAt",
			"metrics.liquidityUpdatedAt"
		]);
	}

	convertCandle(candle: IDexToolCandle) {
		return this._dateService.convertKeysToDate(candle, ["ts", "firstTimestamp", "lastTimestamp", "time"]);
	}
}
