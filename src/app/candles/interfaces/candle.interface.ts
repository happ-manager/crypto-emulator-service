import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { ITransaction } from "./transaction.interface";

export interface ICandle extends IBase {
	id: string;
	poolAddress: string;
	openDate: IDate;
	openPrice: IPrice;
	closeDate: IDate;
	closePrice: IPrice;
	minPrice: IPrice;
	maxPrice: IPrice;
	transactions: ITransaction[];
}
