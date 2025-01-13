import type { IBase } from "../../shared/interfaces/base.interface";
import type { ITradingToken } from "../../trading/interfaces/trading-token.interface";

export interface IPool extends IBase {
	address: string;
	baseMint: string;
	quoteMint: string;
	lpMint: string;
	programId: string;
	authority: string;
	openOrders: string;
	targetOrders: string;
	baseVault: string;
	quoteVault: string;
	withdrawQueue: string;
	lpVault: string;
	marketProgramId: string;
	marketId: string;
	marketAuthority: string;
	marketBaseVault: string;
	marketQuoteVault: string;
	marketBids: string;
	marketAsks: string;
	marketEventQueue: string;
	lookupTableAccount: string;
	baseDecimals: number;
	quoteDecimals: number;
	lpDecimals: number;
	version: number;
	marketVersion: number;
	tradingToken?: ITradingToken;
}
