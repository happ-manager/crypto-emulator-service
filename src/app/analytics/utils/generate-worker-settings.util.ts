import type { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";

function splitRangeWithStep(
	start: number,
	end: number,
	step: number,
	chunks: number
): { start: number; end: number }[] {
	const ranges = [];
	const totalSteps = Math.floor((end - start) / step); // Общее количество шагов
	const stepsPerChunk = Math.floor(totalSteps / chunks); // Шагов в каждом диапазоне
	const remainingSteps = totalSteps % chunks; // Оставшиеся шаги

	let currentStart = start;

	for (let i = 0; i < chunks; i++) {
		const additionalStep = i < remainingSteps ? step : 0; // Распределяем оставшиеся шаги
		const currentEnd = currentStart + stepsPerChunk * step + additionalStep;

		ranges.push({
			start: currentStart,
			end: currentEnd
		});

		currentStart = currentEnd;
	}

	return ranges;
}

export function generateWorkerSettings(props: IGenerateSettingsProps, workerCount: number): IGenerateSettingsProps[] {
	const {
		buyPercentStart,
		buyPercentEnd,
		buyPercentStep,
		sellHighStart,
		sellHighEnd,
		sellHighStep,
		sellLowStart,
		sellLowEnd,
		sellLowStep,
		minTimeStart,
		minTimeEnd,
		minTimeStep,
		maxTimeStart,
		maxTimeEnd,
		maxTimeStep,
		...rest
	} = props;

	// Разделяем диапазоны с учетом шага
	const buyPercentRanges = splitRangeWithStep(buyPercentStart, buyPercentEnd, buyPercentStep, workerCount);
	const sellHighRanges = splitRangeWithStep(sellHighStart, sellHighEnd, sellHighStep, workerCount);
	const sellLowRanges = splitRangeWithStep(sellLowStart, sellLowEnd, sellLowStep, workerCount);
	const minTimeRanges = splitRangeWithStep(minTimeStart, minTimeEnd, minTimeStep, workerCount);
	const maxTimeRanges = splitRangeWithStep(maxTimeStart, maxTimeEnd, maxTimeStep, workerCount);

	// Генерируем настройки для каждого воркера
	const workerSettings: IGenerateSettingsProps[] = [];

	for (let i = 0; i < workerCount; i++) {
		workerSettings.push({
			buyPercentStart: buyPercentRanges[i].start,
			buyPercentEnd: buyPercentRanges[i].end,
			buyPercentStep,
			sellHighStart: sellHighRanges[i].start,
			sellHighEnd: sellHighRanges[i].end,
			sellHighStep,
			sellLowStart: sellLowRanges[i].start,
			sellLowEnd: sellLowRanges[i].end,
			sellLowStep,
			minTimeStart: minTimeRanges[i].start,
			minTimeEnd: minTimeRanges[i].end,
			minTimeStep,
			maxTimeStart: maxTimeRanges[i].start,
			maxTimeEnd: maxTimeRanges[i].end,
			maxTimeStep,
			...rest // Остальные параметры без изменений
		});
	}

	return workerSettings;
}
