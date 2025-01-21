import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AUTO_TRADING } from "../constants/trading.constant";
import { AUTO_TRADING_ENDPOINTS } from "../constants/trading-endpoints.constant";
import { ITradingProps } from "../interfaces/trading.interface";
import { TradingService } from "../services/trading.service";

@ApiTags(AUTO_TRADING)
@Controller(AUTO_TRADING_ENDPOINTS.BASE)
export class AutoTradingController {
	constructor(private readonly _autoTradingService: TradingService) {}

	@Post(AUTO_TRADING_ENDPOINTS.START)
	start(@Body() tradingProps: ITradingProps) {
		this._autoTradingService.start(tradingProps);

		return { message: "Авто трейдинг запущен" };
	}

	@Post(AUTO_TRADING_ENDPOINTS.STOP)
	stop(@Body() tradingProps: ITradingProps) {
		this._autoTradingService.stop(tradingProps.targetWallet);

		return { message: "Авто трейдинг остановлен" };
	}
}
