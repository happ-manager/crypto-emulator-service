import type { Dayjs } from "dayjs";
import type { ValueTransformer } from "typeorm";

import { DATE_CONFIG } from "../../../core/configs/date.config";
import { DateService } from "../services/date.service";

const dateService = new DateService(DATE_CONFIG);

export const DateTransformer: ValueTransformer = {
	to(value: Dayjs | Date | string | null): Date | null {
		// Преобразование для записи в БД
		return value ? dateService.date(value).toDate() : null;
	},
	from(value: Date | null): Dayjs | null {
		// Преобразование для чтения из БД
		return value ? dateService.date(value) : null;
	}
};
