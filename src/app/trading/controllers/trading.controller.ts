import { Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TRADING } from "../constants/trading/trading.constant";
import { TRADING_ENDPOINTS } from "../constants/trading/trading-endpoints.constant";
import { ISwapBody } from "../interfaces/swap-body.interface";
import { TradingService } from "../services/trading.service";

@ApiTags(TRADING)
@Controller(TRADING_ENDPOINTS.BASE)
export class TradingController {
	constructor(private readonly _tradingService: TradingService) {}

	@Post(TRADING_ENDPOINTS.BUY)
	async buy(@Body() body: ISwapBody) {
		const { walletAddress, pool, amount, computeUnits } = body;

		const signer = this._tradingService.signers[walletAddress];

		if (!signer) {
			throw new InternalServerErrorException("Трейдиг должен быть включен");
		}

		const signature = await this._tradingService.buy(pool, signer, amount, computeUnits);

		return { signature };
	}

	@Post(TRADING_ENDPOINTS.SELL)
	async sell(@Body() body: ISwapBody) {
		const { walletAddress, pool, amount, computeUnits } = body;

		const signer = this._tradingService.signers[walletAddress];

		if (!signer) {
			throw new InternalServerErrorException("Трейдиг должен быть включен");
		}

		const signature = await this._tradingService.sell(pool, signer, amount, computeUnits);

		return { signature };
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
