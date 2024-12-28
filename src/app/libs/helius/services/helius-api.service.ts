import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import type { ISolanaApiTransaction } from "../../solana/interfaces/solana-transaction.interface";
import { HELIUS_CONFIG } from "../injection-tokens/helius-config.injection-token";
import { IHeliusConfig } from "../interfaces/helius-config.interface";
import type { ITokenAsset } from "../interfaces/token-asset.interface";

@Injectable()
export class HeliusApiService {
	constructor(
		@Inject(HELIUS_CONFIG) private readonly _heliusConfig: IHeliusConfig,
		private readonly _httpService: HttpService
	) {}

	getTransactions(poolAddress: string, signature?: string) {
		const baseUrl = `https://api.helius.xyz/v0/addresses/${poolAddress}/transactions?api-key=${this._heliusConfig.apiKey}`;
		const query = signature ? `&before=${signature}` : "";

		return this._httpService.get<ISolanaApiTransaction[]>(baseUrl + query);
	}

	async getAsset(mintAddress: string) {
		try {
			const baseUrl = `https://mainnet.helius-rpc.com/?api-key=${this._heliusConfig.apiKey}`;
			const body = JSON.stringify({
				jsonrpc: "2.0",
				id: "test",
				method: "getAsset",
				params: {
					id: mintAddress
				}
			});

			const response = await lastValueFrom(this._httpService.post<{ result: ITokenAsset }>(baseUrl, body));

			if (!response?.data) {
				return;
			}

			return response.data.result;
		} catch (error) {
			console.error(`Canoot get asset for ${mintAddress}`, error);
		}
	}
}
