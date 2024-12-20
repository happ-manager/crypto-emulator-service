import { HttpService } from "@nestjs/axios";
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Big from "big.js";
import { firstValueFrom } from "rxjs";

const SOLANA_PRICE_INTERVAL = 5000;

@Injectable()
export class SolanaPriceService implements OnModuleInit {
	solanaPrice: number = 0;

	constructor(private readonly _httpService: HttpService) {}

	onModuleInit() {
		setTimeout(async () => {
			this.solanaPrice = await this.getSolanaPrice();
			this.startPriceCheck();
		});
	}

	getTokenPrice(prices: number[], parsed?: boolean) {
		const solPercent = parsed ? 1 : 0.000_000_001;
		const memePercent = parsed ? 1 : 0.000_001;

		const sortedPrices = prices.sort((a, b) => a - b);

		const memeCount = sortedPrices.at(-1);
		const solCount = sortedPrices.at(-2);

		const currentTokenPrice = ((solCount * solPercent) / (memeCount * memePercent)) * this.solanaPrice;

		if (currentTokenPrice > 0.000_99) {
			return new Big(0);
		}

		return Big(currentTokenPrice || 0);
	}

	startPriceCheck() {
		setInterval(async () => {
			const price = await this.getSolanaPrice();

			if (price !== this.solanaPrice) {
				this.solanaPrice = price;
			}
		}, SOLANA_PRICE_INTERVAL);
	}

	async getSolanaPrice() {
		const response = await firstValueFrom(
			this._httpService.get("https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112")
		);

		const solanaData = response.data.data;
		const [solanaKey] = Object.keys(solanaData);
		const solPrice = solanaData[solanaKey]?.price;

		if (!solPrice || solPrice < 10) {
			return 211;
		}

		return solPrice;
	}
}
