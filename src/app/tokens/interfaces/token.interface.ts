import type { IBase } from "../../shared/interfaces/base.interface";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import type { ITradingToken } from "../../trading/interfaces/trading-token.interface";

export interface IToken extends IBase {
	id: string;
	chain: string;
	address: string;
	name?: string;
	symbol?: string;
	signals: ISignal[];
	tradingTokens: ITradingToken[];
}
