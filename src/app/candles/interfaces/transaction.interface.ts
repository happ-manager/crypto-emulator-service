import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { ICandle } from "./candle.interface";

export interface ITransaction extends IBase {
	id: string;
	poolAddress: string;
	price: IPrice;
	date: IDate;
	candle: ICandle;
}
