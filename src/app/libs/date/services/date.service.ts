import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import * as isBetween from "dayjs/plugin/isBetween";
import * as isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import * as isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as utc from "dayjs/plugin/utc";

import { DATE_CONFIG } from "../injection-tokens/date-config.injection-token";
import { IDateConfig } from "../interfaces/date-config.interface";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

type KeyPaths = (string | string[])[];

@Injectable()
export class DateService {
	constructor(@Inject(DATE_CONFIG) private readonly config: IDateConfig) {}

	isPast(date: any): boolean {
		return dayjs.utc(date).isBefore(dayjs.utc());
	}

	validateDate(dateStr: string): Date {
		const parsedDate = dayjs.utc(dateStr); // Применение UTC
		if (!parsedDate.isValid()) {
			throw new BadRequestException(`Invalid date format. Expected format: ${this.config.format}`);
		}
		return parsedDate.toDate();
	}

	date(date: any) {
		return dayjs.utc(date); // Применение UTC
	}

	now() {
		return dayjs.utc(); // Применение UTC
	}

	unix(unix: number) {
		return dayjs.unix(unix).utc(); // Применение UTC
	}

	toUTC(date?: any) {
		return dayjs.utc(date); // Применение UTC
	}

	addDays(date: any, days: number) {
		return dayjs.utc(date).add(days, "days"); // Применение UTC
	}

	addHours(date: any, hours: number) {
		return dayjs.utc(date).add(hours, "hours"); // Применение UTC
	}

	format(date: any, format = this.config.format) {
		return dayjs.utc(date).format(format); // Применение UTC
	}

	formatUnix(unixTimestamp: number, format = this.config.format) {
		return dayjs.unix(unixTimestamp).utc().format(format); // Применение UTC
	}

	getTimestamp(date: string) {
		return dayjs.utc(date, this.config.format).valueOf(); // Применение UTC
	}

	toUnix(date: any) {
		return dayjs.utc(date).unix(); // Применение UTC
	}

	isBefore(firstDate: any, secondDate: any) {
		return dayjs.utc(firstDate).isBefore(dayjs.utc(secondDate)); // Применение UTC
	}

	isAfter(firstDate: any, secondDate: any) {
		return dayjs.utc(firstDate).isAfter(dayjs.utc(secondDate)); // Применение UTC
	}

	isSameOrAfter(firstDate: any, secondDate: any) {
		return dayjs.utc(firstDate).isSameOrAfter(dayjs.utc(secondDate)); // Применение UTC
	}

	isSameOrBefore(firstDate: any, secondDate: any) {
		return dayjs.utc(firstDate).isSameOrBefore(dayjs.utc(secondDate)); // Применение UTC
	}

	isBetween(date: any, startDate: any, endDate: any) {
		return dayjs.utc(date).isBetween(dayjs.utc(startDate), dayjs.utc(endDate)); // Применение UTC
	}

	convertKeysToDate<T extends Record<string, any>>(obj: T, keys: KeyPaths): T {
		const result = { ...obj } as Record<string, any>;

		const toDate = (value: any) => {
			if (typeof value === "number") {
				return value.toString().length <= 10 ? dayjs.unix(value).utc() : dayjs.utc(value);
			}
			return dayjs.utc(value);
		};

		for (const key of keys) {
			if (Array.isArray(key)) {
				const [firstKey, ...restKeys] = key;

				if (result[firstKey] && restKeys.length > 0) {
					result[firstKey] = {
						...result[firstKey],
						...this.convertKeysToDate(result[firstKey], [restKeys])
					};
				}
			} else if (result[key]) {
				result[key] = toDate(result[key]);
			}
		}

		return result as T;
	}
}
