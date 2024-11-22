import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { ICandle } from "../interfaces/candle.interface";

export function findCandle<T extends ICandle>(candles: T[], date: IDate): T | null {
	// Попытка найти точное совпадение
	const exactCandle = candles.find(
		(candle) => date.isSameOrAfter(candle.openDate) && date.isSameOrBefore(candle.closeDate)
	);
	if (exactCandle) {
		return exactCandle;
	}

	// Поиск ближайшей следующей свечи
	const nextCandle = candles.find((candle) => candle.openDate.isAfter(date));
	if (nextCandle) {
		return nextCandle;
	}

	// Если следующая свеча отсутствует, берем ближайшую предыдущую
	return [...candles].reverse().find((candle) => candle.closeDate.isBefore(date)) || null;
}
