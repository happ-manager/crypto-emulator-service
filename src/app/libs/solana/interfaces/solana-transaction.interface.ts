import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";

import type { TransactionTypeEnum } from "../../../candles/enums/transaction-type.enum";
import type { IBaseTransaction } from "../../../shared/interfaces/base-transaction.interface";
import type { ISolanaMessage } from "./solana-message.interface";

export type ISolanaOutTransaction = VersionedTransaction | Transaction;

export interface ISolanaInTransaction extends IBaseTransaction {
	poolAddress: string;
	authories?: string[];
	walletAddress?: string;
	tokenMint?: string;
	tokenAmount?: number;
	type: TransactionTypeEnum;
	prices: number[];
	poolKeys: LiquidityPoolKeysV4;
	message: ISolanaMessage;
}

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

interface TokenTransfer {
	fromTokenAccount: string;
	toTokenAccount: string;
	fromUserAccount: string;
	toUserAccount: string;
	tokenAmount: number;
	mint: string;
	tokenStandard: string;
}

interface NativeTransfer {
	fromUserAccount: string;
	toUserAccount: string;
	amount: number;
}

interface AccountData {
	account: string;
	nativeBalanceChange: number;
	tokenBalanceChanges: TokenBalanceChange[];
}

interface TokenBalanceChange {
	userAccount: string;
	tokenAccount: string;
	rawTokenAmount: {
		tokenAmount: string;
		decimals: number;
	};
	mint: string;
}

interface Instruction {
	accounts: string[];
	data: string;
	programId: string;
	innerInstructions: InnerInstruction[];
}

interface InnerInstruction {
	accounts: string[];
	data: string;
	programId: string;
}
