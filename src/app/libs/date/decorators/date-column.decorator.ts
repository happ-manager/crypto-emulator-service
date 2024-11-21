import type { ColumnOptions } from "typeorm";
import { Column } from "typeorm";

import { DateTransformer } from "../transformers/date.transformer";

/**
 * Декоратор для работы с колонками, содержащими даты.
 */
export function DateColumn(options: ColumnOptions = {}) {
	return Column({
		type: "timestamptz",
		transformer: DateTransformer,
		...options
	});
}
