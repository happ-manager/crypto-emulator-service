import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TRADING } from "../constants/trading/trading.constant";
import { TRADING_ENDPOINTS } from "../constants/trading/trading-endpoints.constant";
import { TradingService } from "../services/trading.service";

export interface IBody {
	amount: number;
	microLamports: number;
	units: number;
	wallet: string;
}

@ApiTags(TRADING)
@Controller(TRADING_ENDPOINTS.BASE)
export class TradingController {
	constructor(private readonly _tradingService: TradingService) {}

	@Post(TRADING_ENDPOINTS.BUY)
	buy(@Param("id") poolAddress: string, @Body() body: IBody) {
		const { amount, units, wallet, microLamports } = body;

		return this._tradingService.buy(poolAddress, wallet, amount, units, microLamports);
	}

	@Post(TRADING_ENDPOINTS.SELL)
	sell(@Param("id") poolAddress: string, @Body() body: IBody) {
		const { units, wallet, microLamports } = body;

		return this._tradingService.sell(poolAddress, wallet, units, microLamports);
	}

	@Post(TRADING_ENDPOINTS.START)
	start(tradingId: string) {
		return this._tradingService.start(tradingId);
	}

	@Post(TRADING_ENDPOINTS.STOP)
	stop(tradingId: string) {
		return this._tradingService.stop(tradingId);
	}
}
