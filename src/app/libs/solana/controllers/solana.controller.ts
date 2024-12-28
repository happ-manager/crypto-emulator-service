import { Controller, Get, Query } from "@nestjs/common";

import { SOLANA_ENDPOINTS } from "../constant/solana-endpoints.constant";
import { SolanaService } from "../services/solana.service";

@Controller(SOLANA_ENDPOINTS.BASE)
export class SolanaController {
	constructor(private readonly _solanaService: SolanaService) {}

	@Get(SOLANA_ENDPOINTS.GET_AMOUNT)
	async getAmount(@Query("walletAddress") walletAddress: string, @Query("mintAddress") mintAddress: string) {
		const amount = await this._solanaService.getAmount(walletAddress, mintAddress);

		return { [walletAddress]: amount };
	}

	@Get(SOLANA_ENDPOINTS.GET_ASSET)
	async getAsset(@Query("mintAddress") mintAddress: string) {
		return this._solanaService.getAsset(mintAddress);
	}
}
