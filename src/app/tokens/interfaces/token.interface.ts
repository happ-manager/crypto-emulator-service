import type { IBase } from "../../shared/interfaces/base.interface";
import type { ISignal } from "../../signals/interfaces/signal.interface";

export interface IToken extends IBase {
	id: string;
	name?: string;
	symbol?: string;
	chain?: string;
	tokenAddress?: string;
	poolAddress?: string;
	dexToolsPairId?: string;
	verified: boolean;
	disabled: boolean;
	signal?: ISignal;
}
