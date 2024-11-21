import { HttpService } from "@nestjs/axios";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Connection } from "@solana/web3.js";
import { firstValueFrom } from "rxjs";

import { PROCESSED_CONNECTION } from "../../injection-tokens/processed-connection.injection-token";

@Injectable()
export class WarmupService implements OnModuleInit, OnModuleDestroy {
	private healthCheckInterval: ReturnType<typeof setInterval>;

	constructor(
		@Inject(PROCESSED_CONNECTION) private readonly _connection: Connection,
		private readonly _httpService: HttpService
	) {}

	onModuleInit() {
		setTimeout(this.startHealthCheck.bind(this), 1000);
	}

	startHealthCheck() {
		this.healthCheckInterval = setInterval(async () => {
			try {
				const data = {
					jsonrpc: "2.0",
					id: 420,
					method: "getHealth",
					params: []
				};
				const config = {
					headers: { "Content-Type": "application/json" }
				};
				const response = await firstValueFrom(this._httpService.post(this._connection.rpcEndpoint, data, config));

				if (response.data.error) {
					throw new Error(JSON.stringify(response.data.error));
				}
			} catch {
				// this._loggerService.error(`Error in getHealth request: ${error.message}`);
			}
		}, 1000);
	}

	onModuleDestroy() {
		if (!this.healthCheckInterval) {
			return;
		}

		clearInterval(this.healthCheckInterval);
	}
}
