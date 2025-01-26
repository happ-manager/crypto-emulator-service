/* eslint-disable no-implicit-coercion */
import type { ISignal } from "@happ-manager/crypto-api";

export function createSharedSignalBuffer(signals: ISignal[]) {
	// Определяем фиксированный размер для каждого числового поля
	const BYTES_PER_SIGNAL = 1 * Float64Array.BYTES_PER_ELEMENT; // Только `signaledAt`
	const STRING_FIELDS = ["id", "source", "tokenAddress", "poolAddress"]; // Поля строк
	const buffer = new SharedArrayBuffer(signals.length * BYTES_PER_SIGNAL);

	// Общий буфер для числовых данных
	const sharedSignals = new Float64Array(buffer);

	// Создаем отдельные маппинги для строк
	const stringData: Record<string, string[]> = {};
	for (const field of STRING_FIELDS) {
		stringData[field] = signals.map((signal) => signal[field] || "");
	}

	// Записываем числовые данные
	for (const [index, signal] of signals.entries()) {
		sharedSignals[index] = new Date(signal.signaledAt).getTime(); // UNIX timestamp
	}

	return { buffer, stringData, length: signals.length };
}
