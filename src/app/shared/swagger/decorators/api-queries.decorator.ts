import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

/**
 * Универсальный декоратор для добавления массива query-параметров в Swagger.
 * @param queries Массив объектов, каждый из которых представляет query-параметр.
 */
export function ApiQueries(queries: Record<string, any>[]) {
	const decorators = queries.map((query) => ApiQuery(query));
	return applyDecorators(...decorators);
}
