import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { TokenEntity } from "../entities/token.entity";
import { TokensService } from "../services/tokens.service";

export interface ITokensLoader {
	getTokensBySignals: DataLoader<string, TokenEntity | null>;
	getTokensByTradingTokens: DataLoader<string, TokenEntity | null>;
}

@Injectable()
export class TokensLoader {
	constructor(private readonly _tokensService: TokensService) {}

	createTokensBySignalsLoader() {
		return new DataLoader<string, TokenEntity | null>(async (signalIds: string[]) => {
			const { data } = await this._tokensService.getTokens({
				where: { signals: { id: In(signalIds) } },
				relations: ["signals"]
			});

			return signalIds.map((signalId) => data.find((token) => token.signals.some((signal) => signal.id === signalId)));
		});
	}

	createTokensByTradingTokensLoader() {
		return new DataLoader<string, TokenEntity | null>(async (tradingTokensIds: string[]) => {
			const { data } = await this._tokensService.getTokens({
				where: { tradingTokens: { id: In(tradingTokensIds) } },
				relations: ["tradingTokens"]
			});

			return tradingTokensIds.map((tradingTokenId) =>
				data.find((token) => token.tradingTokens.some((tradingToken) => tradingToken.id === tradingTokenId))
			);
		});
	}
}
