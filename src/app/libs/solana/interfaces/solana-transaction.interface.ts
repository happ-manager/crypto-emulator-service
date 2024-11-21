import type { IDate } from "../../date/interfaces/date.interface";
import type { IPrice } from "../../price/interfaces/price.interface";

export interface ISolanaTransaction {
	price: IPrice;
	date: IDate;
	poolAddress: string;
	authories?: string[];
	walletAddress?: string;
	signature?: string;
}
