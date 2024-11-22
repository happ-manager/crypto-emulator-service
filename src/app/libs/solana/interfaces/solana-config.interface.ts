import type { Connection } from "@solana/web3.js";
import type { AxiosResponse } from "axios";
import type { Observable } from "rxjs";

import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import type { IApiTransaction } from "./api-transaction.interface";

export interface ISolanaProvider {
	connection: Connection;
	subscribe: (accounts: string[], commitment: CommitmentTypeEnum) => void;
	getTransactions: (pollAddress: string, signature?: string) => Observable<AxiosResponse<IApiTransaction[]>>;
}

export interface ISolanaConfig {
	provider: ISolanaProvider;
}
