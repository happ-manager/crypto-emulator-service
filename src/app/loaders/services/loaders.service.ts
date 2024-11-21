import { Injectable } from "@nestjs/common";

import { SignalsLoader } from "../../signals/loaders/signals.loader";
import { ConditionsLoader } from "../../strategies/loaders/conditions.loader";
import { ConditionsGroupsLoader } from "../../strategies/loaders/conditions-groups.loader";
import { MilestonesLoader } from "../../strategies/loaders/milestones.loader";
import { StrategiesLoader } from "../../strategies/loaders/strategies.loader";
import { TokensLoader } from "../../tokens/loaders/tokens.loader";
import { TradingTokensLoader } from "../../trading/loaders/trading-tokens.loader";
import { WalletsLoader } from "../../wallets/loaders/wallets.loader";
import type { ILoaders } from "../interfaces/loaders.interface";

@Injectable()
export class LoadersService {
	readonly loaders: ILoaders = {
		getTokenBySignal: this._tokensLoader.createTokenBySignalLoader(),
		getSignalByToken: this._signalsLoader.createSignalByTokenLoader(),
		getStrategiesByMilestone: this._strategiesLoader.createStrategiesLoaderByMilestones(),
		getStrategiesByTrading: this._strategiesLoader.createStrategiesLoaderByTradings(),
		getMilestonesByStrategy: this._milestonesLoader.createMilestonesLoaderByStrategies(),
		getConditionsGroupByMilestone: this._conditionsGroupsLoader.createConditionsGroupsLoaderByMilestones(),
		getConditionsByConditionsGroup: this._conditionsLoader.createConditionsLoaderByConditionsGroups(),
		getTradingTokensByTradings: this._tradingTokensLoader.createTradingTokensLoaderTradingsGroups(),
		getSourceWalletsByTrading: this._walletsLoader.createSourceWalletsLoaderByTradings(),
		getTargetWalletsByTrading: this._walletsLoader.createTargetWalletsLoaderByTradings()
	};

	constructor(
		private readonly _tokensLoader: TokensLoader,
		private readonly _signalsLoader: SignalsLoader,
		private readonly _strategiesLoader: StrategiesLoader,
		private readonly _milestonesLoader: MilestonesLoader,
		private readonly _conditionsLoader: ConditionsLoader,
		private readonly _conditionsGroupsLoader: ConditionsGroupsLoader,
		private readonly _tradingTokensLoader: TradingTokensLoader,
		private readonly _walletsLoader: WalletsLoader
	) {}
}
