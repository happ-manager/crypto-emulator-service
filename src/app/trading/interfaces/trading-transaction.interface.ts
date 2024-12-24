import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";

import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export interface ITradingTransaction extends IBaseTransaction {
	instructionType: RaydiumInstruction;
	poolKeys: LiquidityPoolKeysV4;
	poolAddress: string;
	basePrice: number;
	quotePrice: number;
	baseMint: string;
	quoteMint: string;
	baseChange: number;
	quoteChange: number;
	signature: string;
}
