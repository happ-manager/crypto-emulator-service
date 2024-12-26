import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import type { IPool } from "../../pools/interfaces/pool.interface";
import { TRADING } from "../constants/trading/trading.constant";
import { TRADING_ENDPOINTS } from "../constants/trading/trading-endpoints.constant";
import { TradingService } from "../services/trading.service";

export interface IBody {
	amount: number;
	microLamports: number;
	units: number;
	walletAddress: string;
	pool: IPool;
}

@ApiTags(TRADING)
@Controller(TRADING_ENDPOINTS.BASE)
export class TradingController {
	constructor(private readonly _tradingService: TradingService) {}

	@Post(TRADING_ENDPOINTS.BUY)
	async buy(@Body() body: IBody) {
		const { amount, units, walletAddress, microLamports, pool } = body;

		await this._tradingService.setVariables(pool, walletAddress);

		const signature = await this._tradingService.buy(pool.address, walletAddress, amount, units, microLamports);

		return { signature };
	}

	@Post(TRADING_ENDPOINTS.SELL)
	async sell(@Body() body: IBody) {
		const { units, walletAddress, microLamports, pool, amount } = body;

		await this._tradingService.setVariables(pool, walletAddress, amount);

		const signature = await this._tradingService.sell(pool.address, walletAddress, units, microLamports);

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
