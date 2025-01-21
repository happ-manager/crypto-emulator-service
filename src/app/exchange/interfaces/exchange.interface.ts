export interface IExchangeProps {
	sourceWallet: string;
	targetWallet: string;
	secret: string;
	tokenTradingDuration: number;
	price: number;
	microLamports: number;
	units: number;
}
