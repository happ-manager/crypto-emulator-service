import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { ITransaction } from "../interfaces/transaction.interface";

export function findTransaction<T extends ITransaction>(candles: T[], date: IDate): T | null {
	// Попытка найти точное совпадение
	const exactCandle = candles.find((candle) => date.isSameOrAfter(candle.date) && date.isSameOrBefore(candle.date));
	if (exactCandle) {
		return exactCandle;
	}

	// Поиск ближайшей следующей свечи
	const nextCandle = candles.find((candle) => candle.date.isAfter(date));
	if (nextCandle) {
		return nextCandle;
	}

	// Если следующая свеча отсутствует, берем ближайшую предыдущую
	return [...candles].reverse().find((candle) => candle.date.isBefore(date)) || null;
}
