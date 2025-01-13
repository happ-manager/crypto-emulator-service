import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { PoolEntity } from "../../../pools/entities/pool.entity";
import { TradingEntity } from "../../entities/trading.entity";
import { TradingTokenEntity } from "../../entities/trading-token.entity";

@Resolver(() => TradingTokenEntity)
export class TradingTokenResolver {
	@ResolveField(() => PoolEntity)
	async pool(@Parent() tradingToken: TradingTokenEntity, @Loaders() loaders: ILoaders) {
		return loaders.getPoolsByTradingTokens.load(tradingToken.id);
	}

	@ResolveField(() => TradingEntity)
	async trading(@Parent() trading: TradingEntity, @Loaders() loaders: ILoaders) {
		return loaders.getTradingsByTradingTokens.load(trading.id);
	}
}
