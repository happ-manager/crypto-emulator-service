export interface IQuoteBody {
	percent_change_1h: number;
	percent_change_24h: number;
	percent_change_7d: number;
	percent_change_30d: number;
	price: number;
	volume_24h: number;
	market_cap: number;
	total_supply: number;
	circulating_supply: number;
	timestamp: string;
}

export interface IQuote {
	timestamp: string;
	quote: {
		USD: IQuoteBody;
	};
}
