import type { ExecutionContext } from "@nestjs/common";
import { BadRequestException, createParamDecorator } from "@nestjs/common";

export const QueryInt = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const value = request.query[data];

	// Пробуем преобразовать значение в число
	const intValue = Number.parseInt(value, 10);
	if (isNaN(intValue)) {
		throw new BadRequestException(`${data} should be a number`);
	}
	return intValue;
});
