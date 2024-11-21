import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CANDLES } from "../constants/candles/candles.constant";
import { CANDLES_ENDPOINTS } from "../constants/candles/candles-endpoints.constant";
import { AccessCandleGuard } from "../guards/candles/access-candle.guard";
import type { ICandle } from "../interfaces/candle.interface";
import { CandlesService } from "../services/candles.service";

@ApiTags(CANDLES)
@Controller(CANDLES_ENDPOINTS.BASE)
export class CandlesController {
	constructor(private readonly _candlesService: CandlesService) {}

	@Get(CANDLES_ENDPOINTS.GET_CANDLE)
	async getCandle(@Param("id") id: string) {
		return this._candlesService.getCandle({ where: { id }, relations: ["transactions"] });
	}

	@Get(CANDLES_ENDPOINTS.GET_CANDLES)
	async getCandles() {
		return this._candlesService.getCandles();
	}

	@Post(CANDLES_ENDPOINTS.CREATE_CANDLE)
	@UseGuards(AccessCandleGuard)
	async createCandle(@Body() candle: Partial<ICandle>) {
		return this._candlesService.createCandle(candle);
	}

	@Patch(CANDLES_ENDPOINTS.UPDATE_CANDLE)
	@UseGuards(AccessCandleGuard)
	async updateCandle(@Param("id") candleId: string, @Body() candle: Partial<ICandle>) {
		return this._candlesService.updateCandle(candleId, candle);
	}

	@Delete(CANDLES_ENDPOINTS.DELETE_CANDLE)
	@UseGuards(AccessCandleGuard)
	async deleteCandle(@Param("id") candleId: string) {
		return this._candlesService.deleteCandle(candleId);
	}
}
