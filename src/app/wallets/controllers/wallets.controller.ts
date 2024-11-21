import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { WALLETS } from "../constants/wallets.constant";
import { WALLETS_ENDPOINTS } from "../constants/wallets-endpoints.constant";
import { AccessWalletGuard } from "../guards/access-wallet.guard";
import type { IWallet } from "../interfaces/wallet.interface";
import { WalletsService } from "../services/wallets.service";

@ApiTags(WALLETS)
@Controller(WALLETS_ENDPOINTS.BASE)
export class WalletsController {
	constructor(private readonly _walletsService: WalletsService) {}

	@Get(WALLETS_ENDPOINTS.GET_WALLET)
	async getWallet(@Param("id") id: string) {
		return this._walletsService.getWallet({ where: { id } });
	}

	@Get(WALLETS_ENDPOINTS.GET_WALLETS)
	async getWallets() {
		return this._walletsService.getWallets();
	}

	@Post(WALLETS_ENDPOINTS.CREATE_WALLET)
	@UseGuards(AccessWalletGuard)
	async createWallet(@Body() wallet: Partial<IWallet>) {
		return this._walletsService.createWallet(wallet);
	}

	@Patch(WALLETS_ENDPOINTS.UPDATE_WALLET)
	@UseGuards(AccessWalletGuard)
	async updateWallet(@Param("id") walletId: string, @Body() wallet: Partial<IWallet>) {
		return this._walletsService.updateWallet(walletId, wallet);
	}

	@Delete(WALLETS_ENDPOINTS.DELETE_WALLET)
	@UseGuards(AccessWalletGuard)
	async deleteWallet(@Param("id") walletId: string) {
		return this._walletsService.deleteWallet(walletId);
	}
}
