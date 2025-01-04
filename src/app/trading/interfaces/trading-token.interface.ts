import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import type { IToken } from "../../tokens/interfaces/token.interface";
import type { ITrading } from "./trading.interface";

export interface ITradingToken extends IBase {
	id: string;
	amount: number;
	disabled: boolean;
	signaledAt: IDate;
	trading: ITrading;
	token: IToken;
	pool: IPool;
	checkedStrategy: IChecked<IStrategy>;
}
