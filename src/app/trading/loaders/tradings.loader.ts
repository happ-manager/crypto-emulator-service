import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { TradingEntity } from "../entities/trading.entity";
import { TradingsService } from "../services/tradings.service";

export interface ITradingsLoader {
	getTradingsByTradingTokens: DataLoader<string, TradingEntity | null>;
}

@Injectable()
export class TradingsLoader {
	constructor(private readonly _tradingsService: TradingsService) {}

	createTradignsByTradingTokensLoader() {
		return new DataLoader<string, TradingEntity | null>(async (tradingTokensIds: string[]) => {
			const { data } = await this._tradingsService.getTradings({
				where: { tradingTokens: { id: In(tradingTokensIds) } },
				relations: ["tradingTokens"]
			});

			return tradingTokensIds.map((tradingTokenId) =>
				data.find((trading) => trading.tradingTokens.some((tradingToken) => tradingToken.id === tradingTokenId))
			);
		});
	}
}
