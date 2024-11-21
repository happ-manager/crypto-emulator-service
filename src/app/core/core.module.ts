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
import { CredentialsModule } from "../credentials/credentials.module";
import { DataModule } from "../data/data.module";
import { EmulatorModule } from "../emulator/emulator.module";
import { EventsModule } from "../events/events.module";
import { CoinGeckoModule } from "../libs/coin-gecko";
import { CoinMarketCapModule } from "../libs/coin-market-cap";
import { CryptoModule } from "../libs/crypto";
import { CryptoCompareModule } from "../libs/crypto-compare";
import { DateModule } from "../libs/date";
import { DexToolsModule } from "../libs/dex-tools";
import { ExcelModule } from "../libs/excel";
import { FilesModule } from "../libs/files";
import { JsonModule } from "../libs/json";
import { JwtModule } from "../libs/jwt";
import { LoggerModule } from "../libs/logger";
import { MessariModule } from "../libs/messari";
import { NomicsModule } from "../libs/nomics";
import { PriceModule } from "../libs/price";
import { SantimentModule } from "../libs/santiment";
import { SolanaModule } from "../libs/solana";
import { SolscanModule } from "../libs/solscan";
import { TelegramModule } from "../libs/telegram";
import { TrojanModule } from "../libs/trojan";
import { LoadersModule } from "../loaders/loaders.module";
import { SHARED_RESOLVERS } from "../shared/resolvers";
import { SignalsModule } from "../signals/signals.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { TestsModule } from "../tests/tests.module";
import { TokensModule } from "../tokens/tokens.module";
import { TradingModule } from "../trading/trading.module";
import { UsersModule } from "../users/users.module";
import { VerificationModule } from "../verification/verification.module";
import { WalletsModule } from "../wallets/wallets.module";
import { COIN_GEKO_CONFIG } from "./configs/coin-gecko.config";
import { COIN_MARKET_CAP_CONFIG } from "./configs/coin-market-cap.config";
import { CRYPTO_CONFIG } from "./configs/crypto.config";
import { DATE_CONFIG } from "./configs/date.config";
import { DEV_TOOLS_CONFIG } from "./configs/dev-tools.config";
import { DEX_TOOLS_CONFIG } from "./configs/dex-tools.config";
import { EVENTS_CONFIG } from "./configs/events.config";
import { EXCEL_CONFIG } from "./configs/excel.config";
import { FILES_CONFIG } from "./configs/files.config";
import { GRAPHQL_CONFIG } from "./configs/graphql.config";
import { JSON_CONFIG } from "./configs/json.config";
import { JWT_CONFIG } from "./configs/jwt.config";
import { LOGGER_CONFIG } from "./configs/logger.config";
import { MESSARI_CONFIG } from "./configs/messari.config";
import { NOMICS_CONFIG } from "./configs/nomics.config";
import { PRICE_CONFIG } from "./configs/price.config";
import { SANTIMENT_CONFIG } from "./configs/santiment.config";
import { SERVER_STATIC_CONFIG } from "./configs/server-static.config";
import { SOLANA_CONFIG } from "./configs/solana.config";
import { SOLSCAN_CONFIG } from "./configs/solscan.config";
import { TELEGRAM_CONFIG } from "./configs/telegram.config";
import { TROJAN_CONFIG } from "./configs/trojan.config";
import { TYPEORM_CONFIG } from "./configs/typeorm.config";

@Module({
	imports: [
		TypeOrmModule.forRoot(TYPEORM_CONFIG),
		JwtModule.forRoot(JWT_CONFIG),
		CryptoModule.forRoot(CRYPTO_CONFIG),
		ServeStaticModule.forRoot(SERVER_STATIC_CONFIG),
		GraphQLModule.forRootAsync<ApolloDriverConfig>(GRAPHQL_CONFIG),
		DevtoolsModule.register(DEV_TOOLS_CONFIG),
		ScheduleModule.forRoot(),
		DexToolsModule.forRoot(DEX_TOOLS_CONFIG),
		CoinMarketCapModule.forRoot(COIN_MARKET_CAP_CONFIG),
		CoinGeckoModule.forRoot(COIN_GEKO_CONFIG),
		CryptoCompareModule.forRoot(COIN_GEKO_CONFIG),
		MessariModule.forRoot(MESSARI_CONFIG),
		NomicsModule.forRoot(NOMICS_CONFIG),
		SantimentModule.forRoot(SANTIMENT_CONFIG),
		SolscanModule.forRoot(SOLSCAN_CONFIG),
		SolanaModule.forRoot(SOLANA_CONFIG),
		TelegramModule.forRoot(TELEGRAM_CONFIG),
		LoggerModule.forRoot(LOGGER_CONFIG),
		FilesModule.forRoot(FILES_CONFIG),
		DateModule.forRoot(DATE_CONFIG),
		ExcelModule.forRoot(EXCEL_CONFIG),
		JsonModule.forRoot(JSON_CONFIG),
		TrojanModule.forRoot(TROJAN_CONFIG),
		EventsModule.forRoot(EVENTS_CONFIG),
		PriceModule.forRoot(PRICE_CONFIG),
		CandlesModule,
		CredentialsModule,
		TestsModule,
		StrategiesModule,
		AnalyticsModule,
		ChannelsModule,
		SignalsModule,
		DataModule,
		LoadersModule,
		AuthModule,
		UsersModule,
		TokensModule,
		EmulatorModule,
		VerificationModule,
		TradingModule,
		DataModule,
		WalletsModule
	],
	providers: SHARED_RESOLVERS
})
export class CoreModule {}
