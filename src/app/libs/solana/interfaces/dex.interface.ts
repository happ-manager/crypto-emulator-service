import type { Commitment, Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";

import type { IPoolKeys } from "./pool-keys.interface";
import type { IRpc } from "./rpc.interface";

export interface IDex {
	swap: (dexSwap: IDexSwap) => Promise<TransactionSignature>;
	wrap: (dexWrap: IDexWrap) => Promise<TransactionSignature>;
}

export interface IDexSwap {
	from: PublicKey;
	to: PublicKey;
	amount: number;
	signer: Keypair;
	rpc: IRpc;
	poolKeys: IPoolKeys;
	blockhash: string;
	microLamports: number;
	units: number;
	skipPreflight: boolean;
	preflightCommitment: Commitment;
	maxRetries: number;
}

export interface IDexWrap {
	amount: number; // Сумма для обмена
	signer: Keypair; // Ключи пользователя
	rpc: IRpc; // RPC-соединение
}
