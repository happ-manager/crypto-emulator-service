import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../helius/services/helius.service";
import { LoggerService } from "../../logger";

const SOLANA_BLOCKHASH_INTERVAL = 60_000;

@Injectable()
export class SolanaBlockhashService implements OnModuleInit {
	blockhash: string = "";

	constructor(
		private readonly _loggerService: LoggerService,
		private readonly _heliusService: HeliusService
	) {}

	onModuleInit() {
		setTimeout(async () => {
			const blockhash = await this.getBlockhash();

			if (!blockhash) {
				return;
			}

			this.blockhash = blockhash;
			this.startBlockhashCheck();
		});
	}

	startBlockhashCheck() {
		setInterval(async () => {
			const blockhash = await this.getBlockhash();

			if (!blockhash) {
				return;
			}

			this.blockhash = blockhash;
		}, SOLANA_BLOCKHASH_INTERVAL);
	}

	async getBlockhash() {
		try {
			const { blockhash } = await this._heliusService.connection.getLatestBlockhash();

			return blockhash;
		} catch (error: any) {
			this._loggerService.error("Cannot get blockhash", error);
			return null;
		}
	}
}
