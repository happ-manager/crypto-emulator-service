import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../helius/services/helius.service";

const SOLANA_BLOCKHASH_INTERVAL = 60_000;

@Injectable()
export class SolanaBlockhashService implements OnModuleInit {
	blockhash: string = "";

	constructor(private readonly _heliusService: HeliusService) {}

	onModuleInit() {
		setTimeout(async () => {
			const { blockhash } = await this._heliusService.connection.getLatestBlockhash();

			this.blockhash = blockhash;
			this.startBlockhashCheck();
		});
	}

	startBlockhashCheck() {
		setInterval(async () => {
			const { blockhash } = await this._heliusService.connection.getLatestBlockhash();

			this.blockhash = blockhash;
		}, SOLANA_BLOCKHASH_INTERVAL);
	}
}
