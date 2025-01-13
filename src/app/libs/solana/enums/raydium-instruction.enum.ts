export enum RaydiumInstruction {
	"INIT_POOL" = 0,
	"CREATE_POOL" = 1,
	"ADD_LIQUIDITY" = 3,
	"REMOVE_LIQUIDITY" = 4,
	"SWAP_FIXED_IN" = 9,
	"SWAP_FIXED_OUT" = 11,
	"SIMULATE_POOL" = 12
}

export const SWAP_INSTRUCTIONS = [RaydiumInstruction.SWAP_FIXED_IN, RaydiumInstruction.SWAP_FIXED_OUT];
export const INIT_INSTRUCTIONS = [RaydiumInstruction.INIT_POOL, RaydiumInstruction.CREATE_POOL];
