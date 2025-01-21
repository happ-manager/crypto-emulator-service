import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EXCHANGE } from "../constants/exchange.constant";
import { EXCHANGE_ENDPOINTS } from "../constants/exchange-endpoints.constant";
import { ExchangeService } from "../services/exchange.service";

@ApiTags(EXCHANGE)
@Controller(EXCHANGE_ENDPOINTS.BASE)
export class ExchangeController {
	constructor(private readonly _exchangeService: ExchangeService) {}

	@Post(EXCHANGE_ENDPOINTS.BUY)
	async buy(@Body() body: any) {
		const { signer, poolId, amount, computeUnits } = body; // TODO

		const signature = await this._exchangeService.buy(poolId, signer, amount, computeUnits);

		return { signature };
	}

	@Post(EXCHANGE_ENDPOINTS.SELL)
	async sell(@Body() body: any) {
		const { signer, poolId, amount, computeUnits } = body;

		const signature = await this._exchangeService.sell(poolId, signer, amount, computeUnits);

		return { signature };
	}
}
