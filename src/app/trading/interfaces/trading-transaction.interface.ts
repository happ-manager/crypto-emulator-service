import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export interface ITradingTransaction extends IBaseTransaction {
	pool: IPool;
	instructionType: RaydiumInstruction;
	amount: number;
	signature: string;
	nextPrice: number;
}
