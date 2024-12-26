import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import type { IToken } from "../../tokens/interfaces/token.interface";
import type { ITrading } from "./trading.interface";

export interface ITradingToken extends IBase {
	id: string;
	walletAddress: string;
	poolAddress: string;
	quoteMint: string;
	baseMint: string;
	amount: number;
	signaledAt: IDate;
	quotePrice: IPrice;
	basePrice: IPrice;
	trading: ITrading;
	active: boolean;
	token?: IToken;
	pool?: IPool;
	checkedStrategy?: IChecked<IStrategy>;
}
