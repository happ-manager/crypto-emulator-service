export function percentDiff(value: number, other: number): number {
	if (other === 0) {
		return 0; // Избегаем деления на ноль
	}
	return ((value - other) / other) * 100;
}

export function percentOf(value: number, percent: number): number {
	return (value * percent) / 100;
}

export function percentChange(value: number, percent: number): number {
	return value * (1 + percent / 100);
}
