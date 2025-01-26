import type { IClownStrategyParmas } from "@happ-manager/crypto-api";

import type { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";

export interface ISignalsParams {
	startHour: number;
	endHour: number;
}

export function generateSettings(
	props?: IGenerateSettingsProps
): (IClownStrategyParmas & { startHour: number; endHour: number })[] {
	const {
		buyPercentStart = -5,
		buyPercentEnd = -75,
		buyPercentStep = -5,
		sellHighStart = 5,
		sellHighEnd = 75,
		sellHighStep = 5,
		sellLowStart = 5,
		sellLowEnd = 75,
		sellLowStep = 5,
		minTimeStart = 1000,
		minTimeEnd = 5000,
		minTimeStep = 1000,
		maxTimeStart = 100_000,
		maxTimeEnd = 150_000,
		maxTimeStep = 1000,
		hourRangeStart = 0,
		hourRangeEnd = 24,
		hourRangeStep = 8
	} = props || {};

	const settings: (IClownStrategyParmas & ISignalsParams)[] = [];

	// Диапазоны значений
	const buyPercentRange = range(buyPercentStart, buyPercentEnd, buyPercentStep);
	const sellHighPercentRange = range(sellHighStart, sellHighEnd, sellHighStep);
	const sellLowPercentRange = range(sellLowStart, sellLowEnd, sellLowStep);
	const minTimeRange = range(minTimeStart, minTimeEnd, minTimeStep);
	const maxTimeRange = range(maxTimeStart, maxTimeEnd, maxTimeStep);
	const hourRanges = hoursRange(hourRangeStart, hourRangeEnd, hourRangeStep);

	// Генерация всех комбинаций
	for (const buyPercent of buyPercentRange) {
		for (const sellHighPercent of sellHighPercentRange) {
			for (const sellLowPercent of sellLowPercentRange) {
				for (const minTime of minTimeRange) {
					for (const maxTime of maxTimeRange) {
						for (const { startHour, endHour } of hourRanges) {
							settings.push({
								buyPercent,
								sellHighPercent,
								sellLowPercent,
								minTime,
								maxTime,
								startHour,
								endHour
							});
						}
					}
				}
			}
		}
	}

	return settings;
}

// Вспомогательная функция для генерации диапазона чисел
export function range(start: number, end: number, step: number): number[] {
	const result: number[] = [];
	if (step > 0) {
		for (let i = start; i <= end; i += step) {
			result.push(i);
		}
	} else {
		for (let i = start; i >= end; i += step) {
			result.push(i);
		}
	}
	return result;
}

// Функция для генерации часовых промежутков
export function hoursRange(start: number, end: number, step: number) {
	const ranges: { startHour: number; endHour: number }[] = [];

	if (step > 0) {
		// Фиксированный шаг
		for (let i = start; i + step <= end; i++) {
			ranges.push({ startHour: i, endHour: i + step });
		}
	} else {
		// Все возможные шаги
		let dynamicStep = 1;
		while (dynamicStep <= end - start) {
			for (let i = end - dynamicStep; i >= start; i--) {
				ranges.push({ startHour: i, endHour: i + dynamicStep });
			}
			dynamicStep++;
		}
	}

	return ranges;
}
