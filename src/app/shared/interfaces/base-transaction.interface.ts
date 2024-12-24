import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPrice } from "../../libs/price/interfaces/price.interface";

export interface IBaseTransaction {
	date: IDate;
	price: IPrice;
	author: string;
}
