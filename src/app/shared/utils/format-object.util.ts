import type Big from "big.js";
import type { Dayjs } from "dayjs";

type InputObject = Record<string, any>;

interface FormattedObject {
	[key: string]: string | FormattedObject | string[]; // Форматированный объект
}

export const formatObject = (input: InputObject): FormattedObject => {
	const isDayJS = (value: any): value is Dayjs => value && typeof value.isValid === "function" && value.isValid();
	const isBigJS = (value: any): value is Big => value && typeof value.toFixed === "function";

	const formatValue = (value: any): string | FormattedObject | string[] => {
		if (isDayJS(value)) {
			return value.toISOString(); // Преобразуем DayJS в ISO строку
		}
		if (isBigJS(value)) {
			return value.toString(); // Преобразуем BigJS в строку
		}
		if (Array.isArray(value)) {
			return value.map(formatValue) as any as FormattedObject; // Рекурсивно обрабатываем массив
		}
		if (typeof value === "object" && value !== null) {
			return formatObject(value); // Рекурсивно обрабатываем вложенные объекты
		}
		return value; // Возвращаем неизменённое значение для других типов
	};

	const result: FormattedObject = {};
	for (const key in input) {
		if (Object.prototype.hasOwnProperty.call(input, key)) {
			result[key] = formatValue(input[key]);
		}
	}

	return result;
};

export const consoleFormat = (input: InputObject) => console.log(formatObject(input));
