import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import type { IPoolKeys } from "../../libs/solana/interfaces/pool-keys.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export interface ITradingTransaction extends IBaseTransaction {
	instructionType: RaydiumInstruction;
	poolKeys: IPoolKeys;
	poolAddress: string;
	basePrice: number;
	quotePrice: number;
	baseMint: string;
	quoteMint: string;
	baseChange: number;
	quoteChange: number;
	signature: string;
}
