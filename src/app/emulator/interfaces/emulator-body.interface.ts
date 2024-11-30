import type { ISignal } from "../../signals/interfaces/signal.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import type { IWallet } from "../../wallets/interfaces/wallet.interface";

export interface IEmulateBody {
	tokens: ISignal[];
	wallets: IWallet[];
	strategies: IStrategy[];
	delay: number;
}
