import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { IToken } from "../../tokens/interfaces/token.interface";

export interface ISignal extends IBase {
	id: string;
	source: string;
	signaledAt: IDate;
	tokenName?: string;
	tokenAddress?: string;
	poolAddress?: string;
	token?: IToken;
}
