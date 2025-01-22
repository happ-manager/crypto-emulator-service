import type { IBaseTransaction } from "@happ-manager/crypto-api";

export function findTransaction<T extends IBaseTransaction>(candles: T[], date: Date): T | null {
	// Попытка найти точное совпадение
	const exactCandle = candles.find((candle) => date >= candle.date && date <= candle.date);
	if (exactCandle) {
		return exactCandle;
	}

	// Поиск ближайшей следующей свечи
	const nextCandle = candles.find((candle) => candle.date > date);
	if (nextCandle) {
		return nextCandle;
	}

	// Если следующая свеча отсутствует, берем ближайшую предыдущую
	return [...candles].reverse().find((candle) => candle.date < date) || null;
}
