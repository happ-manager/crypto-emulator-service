import { HttpService } from "@nestjs/axios";
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Big from "big.js";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SolanaPriceService implements OnModuleInit {
	private currentSolanaPrice: number = 0;

	constructor(private readonly _httpService: HttpService) {}

	onModuleInit() {
		setTimeout(this.startPriceCheck.bind(this));
	}

	getSolanaPrice() {
		return this.currentSolanaPrice;
	}

	computeMemeTokenPrice(prices: number[], parsed?: boolean) {
		const solPercent = parsed ? 1 : 0.000_000_001;
		const memePercent = parsed ? 1 : 0.000_001;

		const solPrice = this.getSolanaPrice();

		const sortedPrices = prices.sort((a, b) => a - b);

		const memeCount = sortedPrices.at(-1);
		const solCount = sortedPrices.at(-2);

		const currentTokenPrice = ((solCount * solPercent) / (memeCount * memePercent)) * solPrice;

		if (currentTokenPrice > 0.000_99) {
			return;
		}

		return Big(currentTokenPrice || 0);
	}

	async fetchSolanaPrice(): Promise<number> {
		const response = await firstValueFrom(
			this._httpService.get("https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112")
		);

		const solanaData = response.data.data;
		const [solanaKey] = Object.keys(solanaData);
		const solPrice = solanaData[solanaKey]?.price;

		if (!solPrice || solPrice < 10) {
			// this._loggerService.error("No Solana Price");
			return 211;
		}

		if (solPrice) {
			return solPrice;
		}
	}

	async startPriceCheck(): Promise<void> {
		setInterval(async () => {
			const price = await this.fetchSolanaPrice();

			if (price !== this.currentSolanaPrice) {
				this.currentSolanaPrice = price;
			}
		}, 3000);
	}
}
