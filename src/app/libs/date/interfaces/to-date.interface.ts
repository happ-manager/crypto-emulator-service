import type { IDate } from "./date.interface";

export type IToDate<T, Keys extends keyof T> = Omit<T, Keys> & {
	[K in Keys]: IDate;
};
