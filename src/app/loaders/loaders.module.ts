import { Module } from "@nestjs/common";

import { CandlesModule } from "../candles/candles.module";
import { PoolsModule } from "../pools/pools.module";
import { SignalsModule } from "../signals/signals.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { TokensModule } from "../tokens/tokens.module";
import { TradingModule } from "../trading/trading.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { LOADERS_SERVICES } from "./services";

@Module({
	imports: [
		UsersModule,
		TokensModule,
		SignalsModule,
		StrategiesModule,
		TradingModule,
		WalletsModule,
		CandlesModule,
		PoolsModule
	],
	providers: LOADERS_SERVICES,
	exports: LOADERS_SERVICES
})
export class LoadersModule {}
