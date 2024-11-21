interface TokenInfo {
	name: string;
	symbol: string;
	blockchain: string;
	topHolders: string;
	tokenAddress: string;
	marketCap: string;
	ath: string;
	price: string;
	liquidity: string;
	liquidityBurned: boolean;
	priceChanges: {
		"5m": string;
		"1h": string;
		"24h": string;
	};
	volume: {
		"1h": string;
		"6h": string;
		"24h": string;
	};
	buysSells: {
		"1h": string;
		"24h": string;
	};
	holders: number;
	age: string;
}
