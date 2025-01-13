import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../libs/helius/services/helius.service";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { sleep } from "../../shared/utils/sleep.util";
import { TradingService } from "../../trading/services/trading.service";

@Injectable()
export class InitService implements OnModuleInit {
	constructor(
		private readonly _heliusService: HeliusService,
		private readonly _solanaService: SolanaService,
		private readonly _tradingService: TradingService
	) {}

	onModuleInit() {
		setTimeout(this.init.bind(this));
	}

	async init() {
		await this._solanaService.init();
		this._heliusService.init();

		await sleep(1000);

		await this._tradingService.init();
	}
}
