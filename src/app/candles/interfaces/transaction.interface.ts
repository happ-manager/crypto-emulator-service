import type { IBase } from "../../shared/interfaces/base.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import type { ICandle } from "./candle.interface";

export interface ITransaction extends IBase, IBaseTransaction {
	id: string;
	poolAddress: string;
	signature: string;
	author: string;
	candle?: ICandle;
}
