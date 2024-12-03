import { Injectable } from "@nestjs/common";
import Big from "big.js";

// Расширяем интерфейс Big
declare module "big.js" {
	interface Big {
		percentDiff(other: Big): Big;
		percentOf(percent: number): Big;
		percentChange(percent: number): Big;
	}
}

// Добавляем методы в прототип Big
(Big as any).prototype.percentDiff = function (this: Big, other: Big): Big {
	if (other.eq(0)) {
		return Big(0);
	}
	return this.minus(other).div(other).times(100);
};

(Big as any).prototype.percentOf = function (this: Big, percent: number): Big {
	return this.times(percent).div(100);
};

(Big as any).prototype.percentChange = function (this: Big, percent: number): Big {
	return this.times(new Big(1).plus(new Big(percent).div(100)));
};

@Injectable()
export class PriceService {
	/**
	 * Конвертирует указанные ключи объекта в значения Big.js
	 * @param obj - Исходный объект
	 * @param keys - Ключи для преобразования
	 * @returns Новый объект с преобразованными значениями
	 */
	convertKeysToPrice<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): T {
		const result = { ...obj } as Record<any, any>;

		const toBig = (value: any) => {
			try {
				return new Big(value);
			} catch {
				return null; // Если значение не может быть преобразовано
			}
		};

		for (const key of keys) {
			if (result[key]) {
				result[key] = Array.isArray(result[key]) ? result[key].map(toBig) : toBig(result[key]);
			}
		}

		return result as T;
	}

	price(value: number | string) {
		return new Big(value);
	}
}
