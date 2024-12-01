import type { IBaseTransaction } from "../../../shared/interfaces/base-transaction.interface";

export interface ISolanaTransaction extends IBaseTransaction {
	poolAddress: string;
	authories?: string[];
	walletAddress?: string;
	signature?: string;
}
