import type { ITransactiosnLoader } from "../../candles/loaders/transactions.loader";
import type { IPoolsLoader } from "../../pools/loaders/pools.loader";
import type { ISignalsLoader } from "../../signals/loaders/signals.loader";
import type { IConditionsLoader } from "../../strategies/loaders/conditions.loader";
import type { IConditionsGroupsLoader } from "../../strategies/loaders/conditions-groups.loader";
import type { IMilestonesLoader } from "../../strategies/loaders/milestones.loader";
import type { IStrategiesLoader } from "../../strategies/loaders/strategies.loader";
import type { ITokensLoader } from "../../tokens/loaders/tokens.loader";
import type { ITradingTokensLoader } from "../../trading/loaders/trading-tokens.loader";
import type { ITradingsLoader } from "../../trading/loaders/tradings.loader";
import type { IUsersLoader } from "../../users/loaders/users.loader";
import type { IWalletsLoader } from "../../wallets/loaders/wallets.loader";

export type ILoaders = IUsersLoader &
	ITokensLoader &
	ISignalsLoader &
	IStrategiesLoader &
	IMilestonesLoader &
	IConditionsGroupsLoader &
	IConditionsLoader &
	ITradingTokensLoader &
	IWalletsLoader &
	ITransactiosnLoader &
	ITradingsLoader &
	IPoolsLoader;
