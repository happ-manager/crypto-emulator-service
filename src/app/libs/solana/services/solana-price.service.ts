import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SolanaPriceService {
	solanaPrice: number = 0;

	constructor(private readonly _httpService: HttpService) {}

	async startPriceCheck(interval: number) {
		this.solanaPrice = await this.getSolanaPrice();

		return setInterval(async () => {
			const price = await this.getSolanaPrice();

			if (price !== this.solanaPrice) {
				this.solanaPrice = price;
			}
		}, interval);
	}

	async getSolanaPrice() {
		const response = await firstValueFrom(
			this._httpService.get("https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112")
		);

		const solanaData = response.data.data;
		const [solanaKey] = Object.keys(solanaData);
		const solPrice = solanaData[solanaKey]?.price;

		if (!solPrice || solPrice < 10) {
			return 189;
		}

		return Number(solPrice);
	}
}
