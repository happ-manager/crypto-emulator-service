import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { IPrice } from "../../libs/price/interfaces/price.interface";
import { TRADING } from "../constants/trading/trading.constant";
import { TRADING_ENDPOINTS } from "../constants/trading/trading-endpoints.constant";
import { TradingService } from "../services/trading.service";

@ApiTags(TRADING)
@Controller(TRADING_ENDPOINTS.BASE)
export class TradingController {
	constructor(private readonly _tradingService: TradingService) {}

	@Post(TRADING_ENDPOINTS.BUY)
	buy(poolAddress: string, price: IPrice, walletSercret: string) {
		// return this._tradingService.buy(poolAddress, price, walletSercret);
	}

	@Post(TRADING_ENDPOINTS.SELL)
	sell(poolAddress: string, walletSecret: string) {
		// return this._tradingService.sell(poolAddress, walletSecret);
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
