import Big from "big.js";
import type { ValueTransformer } from "typeorm";

export const PriceTransformer: ValueTransformer = {
	to(value: Big | string | null): string | null {
		// Преобразование для записи в БД
		return value ? new Big(value).toString() : null;
	},
	from(value: string | null): Big | null {
		// Преобразование для чтения из БД
		return value ? new Big(value) : null;
	}
};
