import type BN from "bn.js";

export function decodeAmount(amount: BN, decimals: number) {
	return Number(amount.toString()) / 10 ** decimals;
}
