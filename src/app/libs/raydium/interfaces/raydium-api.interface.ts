import type { TxVersionEnum } from "../enums/tx-version.enum";

export interface IRPriorityFeeResponse {
	id: string;
	success: boolean;
	data: { default: { vh: number; h: number; m: number } };
}

export interface IRSwapInfoResponse {
	id: string;
	success: true;
	version: "V0" | "V1";
	openTime?: undefined;
	msg: undefined;
	data: {
		swapType: "BaseIn" | "BaseOut";
		inputMint: string;
		inputAmount: string;
		outputMint: string;
		outputAmount: string;
		otherAmountThreshold: string;
		slippageBps: number;
		priceImpactPct: number;
		routePlan: {
			poolId: string;
			inputMint: string;
			outputMint: string;
			feeMint: string;
			feeRate: number;
			feeAmount: string;
		}[];
	};
}

export interface IRSwapTransactionsParams {
	computeUnitPriceMicroLamports: string;
	swapResponse: IRSwapInfoResponse;
	txVersion: TxVersionEnum;
	wallet: string;
	wrapSol: boolean;
	unwrapSol: boolean; // true means output mint receive sol, false means output mint received wsol
	inputAccount?: string;
	outputAccount?: string;
}

export interface IRSwapTransactionsResponse {
	id: string;
	version: string;
	success: boolean;
	data: { transaction: string }[];
}
