import type { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";

function splitRangeUniformly(start: number, end: number, chunks: number): { start: number; end: number }[] {
	const ranges = [];
	const totalRange = end - start;
	const chunkSize = Math.floor(totalRange / chunks); // Размер диапазона для каждого куска
	const remaining = totalRange % chunks; // Остаток, если диапазон не делится равномерно

	let currentStart = start;

	for (let i = 0; i < chunks; i++) {
		const currentEnd = currentStart + chunkSize + (i < remaining ? 1 : 0); // Распределяем остаток равномерно
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

	// Разделяем диапазоны равномерно
	const buyPercentRanges = splitRangeUniformly(buyPercentStart, buyPercentEnd, workerCount);
	const sellHighRanges = splitRangeUniformly(sellHighStart, sellHighEnd, workerCount);
	const sellLowRanges = splitRangeUniformly(sellLowStart, sellLowEnd, workerCount);
	const minTimeRanges = splitRangeUniformly(minTimeStart, minTimeEnd, workerCount);
	const maxTimeRanges = splitRangeUniformly(maxTimeStart, maxTimeEnd, workerCount);

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
