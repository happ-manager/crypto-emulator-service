import type { Keypair } from "@solana/web3.js";

import type { TxVersionEnum } from "../enums/tx-version.enum";

export interface IRaydiumSwap {
	owner: Keypair;
	inputMint: string;
	outputMint: string;
	amount: number;
	slippage?: number;
	txVersion?: TxVersionEnum;
}
