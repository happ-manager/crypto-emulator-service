import type { ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AnalyticsModule } from "../analytics/analytics.module";
import { AuthModule } from "../auth/auth.module";
import { CandlesModule } from "../candles/candles.module";
import { ChannelsModule } from "../channels/channels.module";
import { EmulatorModule } from "../emulator/emulator.module";
import { EventsModule } from "../events/events.module";
import { HealthModule } from "../health/health.module";
import { CryptoModule } from "../libs/crypto";
import { FilesModule } from "../libs/files";
import { HeliusModule } from "../libs/helius";
import { JwtModule } from "../libs/jwt";
import { LoggerModule } from "../libs/logger";
import { SolanaModule } from "../libs/solana";
import { LoadersModule } from "../loaders/loaders.module";
import { PoolsModule } from "../pools/pools.module";
import { SHARED_RESOLVERS } from "../shared/resolvers";
import { SignalsModule } from "../signals/signals.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { TokensModule } from "../tokens/tokens.module";
import { TradingModule } from "../trading/trading.module";
import { UsersModule } from "../users/users.module";
import { WalletsModule } from "../wallets/wallets.module";
import { CRYPTO_CONFIG } from "./configs/crypto.config";
import { DEV_TOOLS_CONFIG } from "./configs/dev-tools.config";
import { EVENTS_CONFIG } from "./configs/events.config";
import { FILES_CONFIG } from "./configs/files.config";
import { GRAPHQL_CONFIG } from "./configs/graphql.config";
import { HELIUS_CONFIG } from "./configs/helius.config";
import { JWT_CONFIG } from "./configs/jwt.config";
import { LOGGER_CONFIG } from "./configs/logger.config";
import { SERVER_STATIC_CONFIG } from "./configs/server-static.config";
import { TYPEORM_CONFIG } from "./configs/typeorm.config";
import { CORE_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forRoot(TYPEORM_CONFIG),
		JwtModule.forRoot(JWT_CONFIG),
		CryptoModule.forRoot(CRYPTO_CONFIG),
		ServeStaticModule.forRoot(SERVER_STATIC_CONFIG),
		GraphQLModule.forRootAsync<ApolloDriverConfig>(GRAPHQL_CONFIG),
		DevtoolsModule.register(DEV_TOOLS_CONFIG),
		ScheduleModule.forRoot(),
		LoggerModule.forRoot(LOGGER_CONFIG),
		FilesModule.forRoot(FILES_CONFIG),
		EventsModule.forRoot(EVENTS_CONFIG),
		HeliusModule.forRoot(HELIUS_CONFIG),
		SolanaModule,
		HealthModule,
		PoolsModule,
		LoadersModule,
		StrategiesModule,
		AuthModule,
		ChannelsModule,
		SignalsModule,
		UsersModule,
		CandlesModule,
		TokensModule,
		AnalyticsModule,
		EmulatorModule,
		TradingModule,
		WalletsModule
	],
	providers: [...CORE_SERVICES, ...SHARED_RESOLVERS]
})
export class CoreModule {}
