import type { IToken } from "../../tokens/interfaces/token.interface";
import type { IWallet } from "../../wallets/interfaces/wallet.interface";

export interface IAnalyticsBody {
	tokens: IToken[];
	wallets: IWallet[];
}
