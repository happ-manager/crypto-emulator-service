import type { IComputeUnits } from "../../libs/solana/interfaces/compute-units.interface";
import type { IPool } from "../../pools/interfaces/pool.interface";

export interface ISwapBody {
	amount: number;
	walletAddress: string;
	computeUnits: IComputeUnits;
	pool: IPool;
}
