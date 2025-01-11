import type { ICandle } from "../interfaces/candle.interface";

export function findCandle<T extends ICandle>(candles: T[], date: Date): T | null {
	// Попытка найти точное совпадение
	const exactCandle = candles.find((candle) => date <= candle.openDate && date >= candle.closeDate);
	if (exactCandle) {
		return exactCandle;
	}

	// Поиск ближайшей следующей свечи
	const nextCandle = candles.find((candle) => candle.openDate > date);
	if (nextCandle) {
		return nextCandle;
	}

	// Если следующая свеча отсутствует, берем ближайшую предыдущую
	return [...candles].reverse().find((candle) => candle.closeDate < date) || null;
}
