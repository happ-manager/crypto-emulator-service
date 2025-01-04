export function getFibLevel(x: number, y: number, ratio: number): number {
	return y - (y - x) * ratio;
}
