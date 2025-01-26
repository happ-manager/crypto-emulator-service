import type { ISignal } from "@happ-manager/crypto-api";

export function createSharedSignalBuffer(signals: ISignal[]) {
	// Определяем фиксированный размер для числового поля (signaledAt)
	const BYTES_PER_SIGNAL = Float64Array.BYTES_PER_ELEMENT; // Только `signaledAt`
	// const STRING_FIELDS = ["poolAddress"]; // Только `poolAddress`

	// Общий буфер для числовых данных
	const buffer = new SharedArrayBuffer(signals.length * BYTES_PER_SIGNAL);
	const sharedSignals = new Float64Array(buffer);

	// Создаем отдельный маппинг для строк
	const stringData: Record<string, string[]> = {
		poolAddress: signals.map((signal) => signal.poolAddress || "")
	};

	// Записываем числовые данные (signaledAt)
	for (const [index, signal] of signals.entries()) {
		sharedSignals[index] = new Date(signal.signaledAt).getTime(); // UNIX timestamp
	}

	// Возвращаем буфер, строковые данные и длину
	return { buffer, stringData, length: signals.length };
}
