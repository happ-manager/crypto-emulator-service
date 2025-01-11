import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../libs/helius/services/helius.service";
import { LoggerService } from "../../libs/logger";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { TradingService } from "../../trading/services/trading.service";

@Injectable()
export class CoreService implements OnModuleInit, OnModuleDestroy {
	constructor(
		private readonly _tradingService: TradingService,
		private readonly _heliusService: HeliusService,
		private readonly _solanaService: SolanaService,
		private readonly _loggerService: LoggerService
	) {}

	onModuleInit() {
		return;
		setTimeout(this.init.bind(this), 1000);
	}

	async init() {
		this._loggerService.init();
		this._heliusService.init();

		await this._solanaService.init();
		await this._tradingService.init();
	}

	onModuleDestroy() {}
}
