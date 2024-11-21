import type { ITrading } from "../../trading/interfaces/trading.interface";

export interface IWallet {
	id: string;
	name: string;
	address: string;
	secret?: string;
	targetTradings: ITrading[];
	sourceTradings: ITrading[];
}
