import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TRADING_TOKENS_ENDPOINTS } from "../constants/tradings-tokens/trading-tokens-endpoints.constant";
import { TRADING_TOKENS } from "../constants/tradings-tokens/tradings-tokens.constant";
import { AccessTradingGuard } from "../guards/tradings/access-trading.guard";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingTokensService } from "../services/trading-tokens.service";

@ApiTags(TRADING_TOKENS)
@Controller(TRADING_TOKENS_ENDPOINTS.BASE)
export class TradingTokensController {
	constructor(private readonly _tradingTokensService: TradingTokensService) {}

	@Get(TRADING_TOKENS_ENDPOINTS.GET_TRADING_TOKEN)
	async getTradingToken(@Param("id") id: string) {
		return this._tradingTokensService.getTradingToken({ where: { id } });
	}

	@Get(TRADING_TOKENS_ENDPOINTS.GET_TRADING_TOKENS)
	async getTradingTokens() {
		return this._tradingTokensService.getTradingTokens();
	}

	@Post(TRADING_TOKENS_ENDPOINTS.CREATE_TRADING_TOKEN)
	@UseGuards(AccessTradingGuard)
	async createTradingToken(@Body() tradingToken: Partial<ITradingToken>) {
		return this._tradingTokensService.createTradingToken(tradingToken);
	}

	@Patch(TRADING_TOKENS_ENDPOINTS.UPDATE_TRADING_TOKEN)
	@UseGuards(AccessTradingGuard)
	async updateTradingToken(@Param("id") tradingTokenId: string, @Body() tradingToken: Partial<ITradingToken>) {
		return this._tradingTokensService.updateTradingToken(tradingTokenId, tradingToken);
	}

	@Delete(TRADING_TOKENS_ENDPOINTS.DELETE_TRADING_TOKEN)
	@UseGuards(AccessTradingGuard)
	async deleteTradingToken(@Param("id") tradingTokenId: string) {
		return this._tradingTokensService.deleteTradingToken(tradingTokenId);
	}
}
