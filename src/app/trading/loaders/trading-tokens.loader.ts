import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { TradingTokenEntity } from "../entities/trading-token.entity";
import { TradingTokensService } from "../services/trading-tokens.service";

export interface ITradingTokensLoader {
	getTradingTokensByTradings: DataLoader<string, TradingTokenEntity[]>;
}

@Injectable()
export class TradingTokensLoader {
	constructor(private readonly _tradingTokensService: TradingTokensService) {}

	createTradingTokensByTradingsLoader() {
		return new DataLoader<string, TradingTokenEntity[]>(async (tradingsIds: string[]) => {
			const { data } = await this._tradingTokensService.getTradingTokens({
				where: { trading: { id: In(tradingsIds) } },
				relations: ["trading"]
			});

			return tradingsIds.map((id) => data.filter((tradingToken) => tradingToken.trading?.id === id));
		});
	}
}
