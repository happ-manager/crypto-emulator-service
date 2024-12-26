import type { IBase } from "../../shared/interfaces/base.interface";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import type { ITradingToken } from "../../trading/interfaces/trading-token.interface";

export interface IToken extends IBase {
	id: string;
	name?: string;
	symbol?: string;
	chain?: string;
	tokenAddress?: string;
	poolAddress?: string;
	signals: ISignal[];
	tradingTokens: ITradingToken[];
}
