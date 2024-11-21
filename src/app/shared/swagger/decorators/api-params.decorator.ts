import { applyDecorators } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import type { ApiParamOptions } from "@nestjs/swagger/dist/decorators/api-param.decorator";

/**
 * Универсальный декоратор для добавления массива URL-параметров в Swagger.
 * @param params Массив объектов, каждый из которых представляет URL-параметр.
 */
export function ApiParams(params: Record<string, any>[]) {
	const decorators = params.map((param: ApiParamOptions) => ApiParam(param));
	return applyDecorators(...decorators);
}
