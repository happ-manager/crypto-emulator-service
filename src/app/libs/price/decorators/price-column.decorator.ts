import type { ColumnOptions } from "typeorm";
import { Column } from "typeorm";

import { PriceTransformer } from "../transformers/price.transformer";

/**
 * Декоратор для работы с колонками, содержащими цены.
 */
export function PriceColumn(options: ColumnOptions = {}) {
	return Column({
		type: "numeric",
		precision: 20,
		scale: 8,
		transformer: PriceTransformer,
		...options
	});
}
