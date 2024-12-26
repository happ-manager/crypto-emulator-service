import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { PoolEntity } from "../entities/pool.entity";
import { PoolsService } from "../services/pools.service";

export interface IPoolsLoader {
	getPoolsByTradingTokens: DataLoader<string, PoolEntity | null>;
}

@Injectable()
export class PoolsLoader {
	constructor(private readonly _poolsService: PoolsService) {}

	createPoolsByTradingTokensLoader() {
		return new DataLoader<string, PoolEntity | null>(async (tradingTokensIds: string[]) => {
			const { data } = await this._poolsService.getPools({
				where: { tradingToken: { id: In(tradingTokensIds) } },
				relations: ["tradingToken"]
			});

			return tradingTokensIds.map((tradingTokenId) => data.find((token) => token.tradingToken.id === tradingTokenId));
		});
	}
}
