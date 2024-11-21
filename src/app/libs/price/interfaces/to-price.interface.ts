import type { IPrice } from "./price.interface";

export type IToPrice<T, Keys extends keyof T> = Omit<T, Keys> & {
	[K in Keys]: IPrice;
};
