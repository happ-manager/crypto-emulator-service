import type { Commitment, Keypair, TransactionSignature } from "@solana/web3.js";

import type { IPool } from "../../../pools/interfaces/pool.interface";
import type { IRpc } from "./rpc.interface";

export interface IDex {
	swap: (dexSwap: IDexSwap) => Promise<TransactionSignature>;
	wrap: (dexWrap: IDexWrap) => Promise<TransactionSignature>;
}

export interface IDexSwap {
	from: string;
	to: string;
	amount: number;
	signer: Keypair;
	rpc: IRpc;
	pool: IPool;
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
