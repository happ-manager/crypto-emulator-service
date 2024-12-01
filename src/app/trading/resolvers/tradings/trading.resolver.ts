import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { StrategyEntity } from "../../../strategies/entities/strategy.entity";
import { WalletEntity } from "../../../wallets/entities/wallet.entity";
import { TradingEntity } from "../../entities/trading.entity";
import { TradingTokenEntity } from "../../entities/trading-token.entity";

@Resolver(() => TradingEntity)
export class TradingResolver {
	@ResolveField(() => StrategyEntity)
	async strategy(@Parent() trading: TradingEntity, @Loaders() loaders: ILoaders) {
		return loaders.getStrategiesByTradings.load(trading.id);
	}

	@ResolveField(() => WalletEntity)
	async targetWallet(@Parent() trading: TradingEntity, @Loaders() loaders: ILoaders) {
		return loaders.getTargetWalletsByTrading.load(trading.id);
	}

	@ResolveField(() => WalletEntity)
	async sourceWallet(@Parent() trading: TradingEntity, @Loaders() loaders: ILoaders) {
		return loaders.getSourceWalletsByTrading.load(trading.id);
	}

	@ResolveField(() => [TradingTokenEntity])
	async tradingTokens(@Parent() trading: TradingEntity, @Loaders() loaders: ILoaders) {
		return loaders.getTradingTokensByTradings.load(trading.id);
	}
}
