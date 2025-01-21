import type { IStrategy } from "@happ-manager/crypto-api";

export interface ITradingProps {
	strategy: IStrategy;
	sourceWallet: string;
	targetWallet: string;
	secret: string;
	tokenTradingDuration: number;
	price: number;
	microLamports: number;
	units: number;
}
