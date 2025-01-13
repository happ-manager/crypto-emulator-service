import { Module } from "@nestjs/common";

import { PoolsModule } from "../pools/pools.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { TradingModule } from "../trading/trading.module";
import { WalletsModule } from "../wallets/wallets.module";
import { LOADERS_SERVICES } from "./services";

@Module({
	imports: [StrategiesModule, TradingModule, WalletsModule, PoolsModule],
	providers: LOADERS_SERVICES,
	exports: LOADERS_SERVICES
})
export class LoadersModule {}
