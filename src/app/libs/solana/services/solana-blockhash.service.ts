import { Injectable } from "@nestjs/common";

import { HeliusService } from "../../helius/services/helius.service";
import { LoggerService } from "../../logger";

@Injectable()
export class SolanaBlockhashService {
	blockhash: string = "";

	constructor(
		private readonly _loggerService: LoggerService,
		private readonly _heliusService: HeliusService
	) {}

	async startBlockhashCheck(interval: number) {
		const blockhash = await this.getBlockhash();

		if (!blockhash) {
			return;
		}

		this.blockhash = blockhash;

		return setInterval(async () => {
			const blockhash = await this.getBlockhash();

			if (!blockhash) {
				return;
			}

			this.blockhash = blockhash;
		}, interval);
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
