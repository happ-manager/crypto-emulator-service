import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";

import type { IDate } from "../../libs/date/interfaces/date.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export interface ITradingTransaction extends IBaseTransaction {
	date: IDate;
	wsolAmount: number;
	wsolPrice: number;
	tokenAmount: number;
	tokenPrice: number;
	tokenMint: string;
	wsolMint: string;
	poolKeys: LiquidityPoolKeysV4;
	poolAddress: string;
	instructionType: number;
	signature: string;
}
