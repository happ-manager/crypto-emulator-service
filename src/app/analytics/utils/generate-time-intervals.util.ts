export function generateTimeIntervals(start: number, end: number, range: number): [number, number][] {
	const timeIntervals: [number, number][] = [];
	const hoursInDay = 24;

	if (range === 0) {
		// Генерируем все уникальные временные промежутки
		for (let startHour = start; startHour < end; startHour++) {
			for (let endHour = startHour + 1; endHour <= start + hoursInDay && endHour <= end; endHour++) {
				timeIntervals.push([startHour % hoursInDay, endHour % hoursInDay]);
			}
		}
	} else {
		// Генерируем промежутки фиксированной длины range
		for (let startHour = start; startHour < end; startHour++) {
			const endHour = (startHour + range) % hoursInDay;
			timeIntervals.push([startHour, endHour]);
		}
	}

	return timeIntervals;
}
