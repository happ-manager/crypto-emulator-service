import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../shared/modules/helius/services/helius.service";
import { SolanaService } from "../../shared/modules/solana/services/solana.service";

@Injectable()
export class InitService implements OnModuleInit {
	constructor(
		private readonly _heliusService: HeliusService,
		private readonly _solanaService: SolanaService
	) {}

	onModuleInit() {
		setTimeout(this.init.bind(this));
	}

	async init() {
		await this._solanaService.init();
		this._heliusService.init();
	}
}
