export function parseTokenMessage(message: string) {
	try {
		const nameSymbolMatch = /🪙 (.+) \((.+)\)/.exec(message);
		const blockchainMatch = /⛓ (.+)/.exec(message);
		const topHoldersMatch = /🔎 Top 10 holders: (.+)/.exec(message);
		const tokenAddressMatch = /\n([\dA-Za-z]{43,})\n/.exec(message);
		const marketCapMatch = /📊 MCap: \$(.+) \| ATH: \$(.+)/.exec(message);
		const priceMatch = /🏷 Price: \$(.+)/.exec(message);
		const liquidityMatch = /💧 Liq: \$(.+) \((.+)%\)/.exec(message);
		const liquidityBurnedMatch = message.includes("🔥 100.00% Burned");
		const priceChangesMatch = /📉 Price Changes:\s+5m: (.+)% \| 1h: (.+)% \| 24h: (.+)%/.exec(message);
		const volumeMatch = /🎚 Volume:\s+1h: \$(.+) \| 6h: \$(.+) \| 24h: \$(.+)/.exec(message);
		const buysSellsMatch = /🔄 Buys\/Sells:\s+1h: (.+) \| 24h: (.+)/.exec(message);
		const holdersMatch = /🧳 Holders: (\d+)/.exec(message);
		const ageMatch = /⏳ Age: (.+)/.exec(message);

		if (
			!nameSymbolMatch ||
			!blockchainMatch ||
			!topHoldersMatch ||
			!tokenAddressMatch ||
			!marketCapMatch ||
			!priceMatch ||
			!liquidityMatch ||
			!priceChangesMatch ||
			!volumeMatch ||
			!buysSellsMatch ||
			!holdersMatch ||
			!ageMatch
		) {
			return null;
		}

		return {
			name: nameSymbolMatch[1],
			symbol: nameSymbolMatch[2],
			blockchain: blockchainMatch[1],
			topHolders: topHoldersMatch[1],
			tokenAddress: tokenAddressMatch[1],
			marketCap: marketCapMatch[1],
			ath: marketCapMatch[2],
			price: priceMatch[1],
			liquidity: liquidityMatch[1],
			liquidityBurned: liquidityBurnedMatch,
			priceChanges: {
				"5m": priceChangesMatch[1],
				"1h": priceChangesMatch[2],
				"24h": priceChangesMatch[3]
			},
			volume: {
				"1h": volumeMatch[1],
				"6h": volumeMatch[2],
				"24h": volumeMatch[3]
			},
			buysSells: {
				"1h": buysSellsMatch[1],
				"24h": buysSellsMatch[2]
			},
			holders: Number.parseInt(holdersMatch[1], 10),
			age: ageMatch[1]
		};
	} catch {
		return null;
	}
}
