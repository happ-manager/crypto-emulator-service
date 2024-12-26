import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export interface ITradingTransaction extends IBaseTransaction {
	instructionType: RaydiumInstruction;
	pool: IPool;
	poolAddress: string;
	basePrice: number;
	quotePrice: number;
	baseMint: string;
	quoteMint: string;
	baseChange: number;
	quoteChange: number;
	signature: string;
}
