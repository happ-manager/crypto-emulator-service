import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CandlesModule } from "../candles/candles.module";
import { EventsModule } from "../events/events.module";
import { FilesModule } from "../libs/files";
import { LoggerModule } from "../libs/logger";
import { SolanaModule } from "../libs/solana";
import { StrategiesModule } from "../strategies/strategies.module";
import { WalletsModule } from "../wallets/wallets.module";
import { TRADING_CONTROLLERS } from "./controllers";
import { TRADING_ENTITIES } from "./entities";
import { TRADINGS_GUARDS } from "./guards";
import { TRADINGS_LOADERS } from "./loaders";
import { TRADINGS_RESOLVERS } from "./resolvers";
import { TRADING_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature(TRADING_ENTITIES),
		LoggerModule.forChild(),
		FilesModule.forChild(),
		EventsModule.forChild(),
		CandlesModule,
		SolanaModule,
		StrategiesModule,
		WalletsModule
	],
	controllers: TRADING_CONTROLLERS,
	providers: [...TRADING_SERVICES, ...TRADINGS_RESOLVERS, ...TRADINGS_LOADERS, ...TRADINGS_GUARDS],
	exports: [...TRADING_SERVICES, ...TRADINGS_LOADERS]
})
export class TradingModule {}
