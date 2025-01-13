import { Injectable, Logger } from "@nestjs/common";

import { HeliusService } from "../../helius/services/helius.service";

@Injectable()
export class SolanaBlockhashService {
	private readonly _loggerService = new Logger("SolanaBlockhashService");

	blockhash: string = "";

	constructor(private readonly _heliusService: HeliusService) {}

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
