import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { CryptoModule } from "../libs/crypto";
import { DateModule } from "../libs/date";
import { LoggerModule } from "../libs/logger";
import { SolanaModule } from "../libs/solana";
import { TelegramModule } from "../libs/telegram";
import { StrategiesModule } from "../strategies/strategies.module";
import { TRADING_CONTROLLERS } from "./controllers";
import { TRADING_ENTITIES } from "./entities";
import { TRADINGS_GUARDS } from "./guards";
import { TRADINGS_LOADERS } from "./loaders";
import { TRADINGS_RESOLVERS } from "./resolvers";
import { TRADING_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature(TRADING_ENTITIES),
		TelegramModule.forChild(),
		LoggerModule.forChild(),
		DateModule.forChild(),
		EventsModule.forChild(),
		CryptoModule.forChild(),
		SolanaModule,
		StrategiesModule,
		ScheduleModule
	],
	controllers: TRADING_CONTROLLERS,
	providers: [...TRADING_SERVICES, ...TRADINGS_RESOLVERS, ...TRADINGS_LOADERS, ...TRADINGS_GUARDS],
	exports: [...TRADING_SERVICES, ...TRADINGS_LOADERS]
})
export class TradingModule {}
