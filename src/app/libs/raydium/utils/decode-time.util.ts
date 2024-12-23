import type BN from "bn.js";

export function decodeTime(time: BN): Date {
	return new Date(time.toNumber() * 1000); // Приводим дробную часть к нужной длине
}
