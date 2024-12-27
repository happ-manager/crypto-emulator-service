import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { AccessTradingGuard } from "../../../trading/guards/tradings/access-trading.guard";
import { SOLANA_ENDPOINTS } from "../constant/solana-endpoints.constant";
import { SolanaService } from "../services/solana.service";

@Controller(SOLANA_ENDPOINTS.BASE)
export class SolanaController {
	constructor(private readonly _solanaService: SolanaService) {}

	@Get(SOLANA_ENDPOINTS.AMOUNT)
	@UseGuards(AccessTradingGuard)
	async getAmount(@Query("walletAddress") walletAddress: string, @Query("mintAddress") mintAddress: string) {
		const amount = await this._solanaService.getAmount(walletAddress, mintAddress);

		return { [walletAddress]: amount };
	}
}
