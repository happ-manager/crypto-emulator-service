import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import type { Connection } from "@solana/web3.js";
import { firstValueFrom } from "rxjs";

@Injectable()
export class WarmupService {
	constructor(private readonly _httpService: HttpService) {}

	startWarmup(connection: Connection, interval: number) {
		return setInterval(async () => {
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
				const response = await firstValueFrom(this._httpService.post(connection.rpcEndpoint, data, config));

				if (response.data.error) {
					throw new Error(JSON.stringify(response.data.error));
				}
			} catch {
				// this._loggerService.error(`Error in getHealth request: ${error.message}`);
			}
		}, interval);
	}
}
