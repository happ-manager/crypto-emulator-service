import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import type { Commitment, Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";

import type { IRpc } from "./rpc.interface";

export interface IDex {
	swap: (dexSwap: IDexSwap) => Promise<TransactionSignature>;
	wrap: (dexWrap: IDexWrap) => Promise<TransactionSignature>;
}

export interface IDexSwap {
	from: PublicKey;
	to: PublicKey;
	amount: number;
	owner: Keypair;
	rpc: IRpc;
	poolKeys: LiquidityPoolKeysV4;
	blockhash: string;
	microLamports: number;
	units: number;
	skipPreflight: boolean;
	preflightCommitment: Commitment;
	maxRetries: number;
}

export interface IDexWrap {
	amount: number; // Сумма для обмена
	owner: Keypair; // Ключи пользователя
	rpc: IRpc; // RPC-соединение
}
