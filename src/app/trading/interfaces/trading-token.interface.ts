import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { ICheckedStrategy } from "../../strategies/interfaces/checked.interface";
import type { ITrading } from "./trading.interface";

export interface ITradingToken extends IBase {
	id: string;
	amount: number;
	disabled: boolean;
	signaledAt: Date;
	trading: ITrading;
	pool: IPool;
	checkedStrategy: ICheckedStrategy;
}
