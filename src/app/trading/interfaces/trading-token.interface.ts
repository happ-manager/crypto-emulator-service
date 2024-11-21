import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { TradingTokenStatusEnum } from "../enums/trading-token-status.enum";
import type { ITrading } from "./trading.interface";

export interface ITradingToken extends IBase {
	id: string;
	walletAddress: string;
	poolAddress: string;
	status: TradingTokenStatusEnum;
	signaledAt?: IDate;
	signaledPrice?: IPrice;
	enterAt?: IDate;
	enterPrice?: IPrice;
	exitAt?: IDate;
	exitPrice?: IPrice;
	initialPrice?: IPrice;
	initialAt?: IDate;
	trading: ITrading;
}
