import { Module } from "@nestjs/common";

import { SignalsModule } from "../signals/signals.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { TokensModule } from "../tokens/tokens.module";
import { TradingModule } from "../trading/trading.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { LOADERS_SERVICES } from "./services";

@Module({
	imports: [UsersModule, TokensModule, SignalsModule, StrategiesModule, TradingModule, WalletsModule],
	providers: LOADERS_SERVICES,
	exports: LOADERS_SERVICES
})
export class LoadersModule {}
