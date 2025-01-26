import type { IClownStrategyParmas } from "@happ-manager/crypto-api";

export function createSharedSettingsBuffer(
	settings: (IClownStrategyParmas & { startHour: number; endHour: number })[]
) {
	// Увеличиваем размер для каждого объекта settings
	const BYTES_PER_SETTING = 7 * Float64Array.BYTES_PER_ELEMENT; // 7 числовых полей
	const buffer = new SharedArrayBuffer(settings.length * BYTES_PER_SETTING);

	// Общий буфер для числовых данных
	const sharedSettings = new Float64Array(buffer);

	// Заполняем буфер данными
	for (const [index, setting] of settings.entries()) {
		const offset = index * 7;
		sharedSettings[offset] = setting.maxTime;
		sharedSettings[offset + 1] = setting.minTime;
		sharedSettings[offset + 2] = setting.buyPercent;
		sharedSettings[offset + 3] = setting.sellHighPercent;
		sharedSettings[offset + 4] = setting.sellLowPercent;
		sharedSettings[offset + 5] = setting.startHour;
		sharedSettings[offset + 6] = setting.endHour;
	}

	return { buffer, length: settings.length };
}
