import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { TokenEntity } from "../entities/token.entity";
import { TokensService } from "../services/tokens.service";

export interface ITokensLoader {
	getTokenBySignal: DataLoader<string, TokenEntity | null>;
}

@Injectable()
export class TokensLoader {
	constructor(private readonly _tokensService: TokensService) {}

	createTokenBySignalLoader() {
		return new DataLoader<string, TokenEntity | null>(async (signalIds: string[]) => {
			const { data } = await this._tokensService.getTokens({
				where: { signal: { id: In(signalIds) } },
				relations: ["signal"]
			});

			return signalIds.map((signalId) => data.find((token) => token.signal?.id === signalId) || null);
		});
	}
}
