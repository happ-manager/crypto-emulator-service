import { Injectable } from "@nestjs/common";

import { SignalsLoader } from "../../signals/loaders/signals.loader";
import { ConditionsLoader } from "../../strategies/loaders/conditions.loader";
import { ConditionsGroupsLoader } from "../../strategies/loaders/conditions-groups.loader";
import { MilestonesLoader } from "../../strategies/loaders/milestones.loader";
import { StrategiesLoader } from "../../strategies/loaders/strategies.loader";
import { TokensLoader } from "../../tokens/loaders/tokens.loader";
import { TradingTokensLoader } from "../../trading/loaders/trading-tokens.loader";
import { TradingsLoader } from "../../trading/loaders/tradings.loader";
import { WalletsLoader } from "../../wallets/loaders/wallets.loader";
import type { ILoaders } from "../interfaces/loaders.interface";

@Injectable()
export class LoadersService {
	readonly loaders: ILoaders = {
		getTokensBySignals: this._tokensLoader.createTokensBySignalsLoader(),
		getTokensByTradingTokens: this._tokensLoader.createTokensByTradingTokensLoader(),
		getSignalsByTokens: this._signalsLoader.createSignalsByTokensLoader(),
		getStrategiesByMilestones: this._strategiesLoader.createStrategiesByMilestonesLoader(),
		getStrategiesByTradings: this._strategiesLoader.createStrategiesByTradingsLoader(),
		getMilestonesByStrategies: this._milestonesLoader.createMilestonesByStrategiesLoader(),
		getConditionsGroupsByMilestones: this._conditionsGroupsLoader.createConditionsGroupsByMilestonesLoader(),
		getConditionsByConditionsGroup: this._conditionsLoader.createConditionsByConditionsGroupsLoader(),
		getTradingTokensByTradings: this._tradingTokensLoader.createTradingTokensByTradingsLoader(),
		getSourceWalletsByTrading: this._walletsLoader.createSourceWalletsByTradingsLoader(),
		getTargetWalletsByTrading: this._walletsLoader.createTargetWalletsByTradingsLoader(),
		getTradingsByTradingTokens: this._tradingsLoader.createTradignsByTradingTokensLoader()
	};

	constructor(
		private readonly _tokensLoader: TokensLoader,
		private readonly _signalsLoader: SignalsLoader,
		private readonly _strategiesLoader: StrategiesLoader,
		private readonly _milestonesLoader: MilestonesLoader,
		private readonly _conditionsLoader: ConditionsLoader,
		private readonly _conditionsGroupsLoader: ConditionsGroupsLoader,
		private readonly _tradingTokensLoader: TradingTokensLoader,
		private readonly _walletsLoader: WalletsLoader,
		private readonly _tradingsLoader: TradingsLoader
	) {}
}
