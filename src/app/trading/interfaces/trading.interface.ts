import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { IBase } from "../../shared/interfaces/base.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import type { IWallet } from "../../wallets/interfaces/wallet.interface";
import type { ITradingToken } from "./trading-token.interface";

export interface ITrading extends IBase {
	id: string;
	price: IPrice;
	strategy: IStrategy;
	targetWallet: IWallet;
	sourceWallet: IWallet;
	disabled: boolean;
	tradingTokens?: ITradingToken[];
}
