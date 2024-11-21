import type { ExecutionContext } from "@nestjs/common";
import { BadRequestException, createParamDecorator } from "@nestjs/common";

import { DATE_CONFIG } from "../../../core/configs/date.config";
import { DateService } from "../index";

/**
 * Декоратор для преобразования даты из строки в объект dayjs.
 * Использует DateService для валидации и преобразования.
 */
export const Date = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const dateService = new DateService(DATE_CONFIG); // Создаем экземпляр DateService, можно инжектировать, если необходимо

	const dateInput = request.query[data];

	if (!dateInput) {
		return null;
	}

	try {
		let date;
		if (/^\d+$/.test(dateInput)) {
			// Если значение - это число, преобразуем как Unix-время
			date = dateService.unix(Number.parseInt(dateInput, 10));
		} else {
			// Иначе предполагаем, что это строка с датой
			date = dateService.date(dateInput);
		}

		if (!date.isValid()) {
			throw new Error();
		}

		return date;
	} catch {
		throw new BadRequestException(
			`Invalid date format for parameter "${data}". Expected a valid date string or Unix timestamp.`
		);
	}
});
