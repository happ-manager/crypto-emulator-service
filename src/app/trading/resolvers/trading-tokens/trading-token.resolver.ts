import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { TokenEntity } from "../../../tokens/entities/token.entity";
import { TradingTokenEntity } from "../../entities/trading-token.entity";

@Resolver(() => TradingTokenEntity)
export class TradingTokenResolver {
	@ResolveField(() => TokenEntity)
	async token(@Parent() tradingToken: TradingTokenEntity, @Loaders() loaders: ILoaders) {
		return loaders.getTokensByTradingTokens.load(tradingToken.id);
	}
}
