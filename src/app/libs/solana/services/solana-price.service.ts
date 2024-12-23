import { HttpService } from "@nestjs/axios";
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
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

		return Number(solPrice);
	}
}
