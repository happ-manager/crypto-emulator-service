import type { Connection, Signer, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import type { AxiosResponse } from "axios";
import type { HeliusSendOptions } from "helius-sdk/dist/src/types";
import type { Observable } from "rxjs";

import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import type { ISolanaApiTransaction, ISolanaTransaction } from "./solana-transaction.interface";

export interface IRpc {
	connection: Connection;
	subscribeTransactions: (accountInclude: string[], accountExclude: string[], commitment: CommitmentTypeEnum) => void;
	sendSmartTransaction: (instructions: TransactionInstruction[], signers: Signer[]) => Promise<TransactionSignature>;
	sendTransaction: (transaction: ISolanaTransaction, options?: HeliusSendOptions) => Promise<TransactionSignature>;
	getTransactions: (pollAddress: string, signature?: string) => Observable<AxiosResponse<ISolanaApiTransaction[]>>;
}
