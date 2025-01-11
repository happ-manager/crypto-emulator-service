import type { IBase } from "../../shared/interfaces/base.interface";
import type { ITransaction } from "./transaction.interface";

export interface ICandle extends IBase {
	id: string;
	poolAddress: string;
	openDate: Date;
	openPrice: number;
	closeDate: Date;
	closePrice: number;
	minPrice: number;
	maxPrice: number;
	transactions: ITransaction[];
}
