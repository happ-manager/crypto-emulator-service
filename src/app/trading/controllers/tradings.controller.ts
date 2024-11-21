import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TRADINGS } from "../constants/tradings/tradings.constant";
import { TRADINGS_ENDPOINTS } from "../constants/tradings/tradings-endpoints.constant";
import { AccessTradingGuard } from "../guards/tradings/access-trading.guard";
import type { ITrading } from "../interfaces/trading.interface";
import { TradingsService } from "../services/tradings.service";

@ApiTags(TRADINGS)
@Controller(TRADINGS_ENDPOINTS.BASE)
export class TradingsController {
	constructor(private readonly _tradingsService: TradingsService) {}

	@Get(TRADINGS_ENDPOINTS.GET_TRADING)
	async getTrading(@Param("id") id: string) {
		return this._tradingsService.getTrading({ where: { id }, relations: ["strategy", "tradingTokens"] });
	}

	@Get(TRADINGS_ENDPOINTS.GET_TRADINGS)
	async getTradings() {
		return this._tradingsService.getTradings();
	}

	@Post(TRADINGS_ENDPOINTS.CREATE_TRADING)
	@UseGuards(AccessTradingGuard)
	async createTrading(@Body() trading: Partial<ITrading>) {
		return this._tradingsService.createTrading(trading);
	}

	@Patch(TRADINGS_ENDPOINTS.UPDATE_TRADING)
	@UseGuards(AccessTradingGuard)
	async updateTrading(@Param("id") tradingId: string, @Body() trading: Partial<ITrading>) {
		return this._tradingsService.updateTrading(tradingId, trading);
	}

	@Delete(TRADINGS_ENDPOINTS.DELETE_TRADING)
	@UseGuards(AccessTradingGuard)
	async deleteTrading(@Param("id") tradingId: string) {
		return this._tradingsService.deleteTrading(tradingId);
	}
}
