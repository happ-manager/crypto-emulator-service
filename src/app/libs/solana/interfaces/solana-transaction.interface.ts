import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { AccountData, Instruction, NativeTransfer, TokenTransfer } from "helius-sdk";

export type ISolanaTransaction = VersionedTransaction | Transaction;

export interface ISolanaApiTransaction {
	description: string;
	type: string;
	source: string;
	fee: number;
	feePayer: string;
	signature: string;
	slot: number;
	timestamp: number;
	tokenTransfers: TokenTransfer[];
	nativeTransfers: NativeTransfer[];
	accountData: AccountData[];
	transactionError: any;
	instructions: Instruction[];
	events: any;
}
