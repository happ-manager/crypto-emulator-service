import type { ISignal } from "../../signals/interfaces/signal.interface";
import type { IWallet } from "../../wallets/interfaces/wallet.interface";

export interface IAnalyticsBody {
	signals: ISignal[];
	wallets: IWallet[];
}
