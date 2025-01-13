import type { ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CryptoModule } from "../libs/crypto";
import { HeliusModule } from "../libs/helius";
import { SolanaModule } from "../libs/solana";
import { PoolsModule } from "../pools/pools.module";
import { SHARED_RESOLVERS } from "../shared/resolvers";
import { TradingModule } from "../trading/trading.module";
import { WalletsModule } from "../wallets/wallets.module";
import { CRYPTO_CONFIG } from "./configs/crypto.config";
import { GRAPHQL_CONFIG } from "./configs/graphql.config";
import { HELIUS_CONFIG } from "./configs/helius.config";
import { TYPEORM_CONFIG } from "./configs/typeorm.config";
import { CORE_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forRoot(TYPEORM_CONFIG),
		GraphQLModule.forRootAsync<ApolloDriverConfig>(GRAPHQL_CONFIG),
		SolanaModule,
		CryptoModule.forRoot(CRYPTO_CONFIG),
		HeliusModule.forRoot(HELIUS_CONFIG),
		EventEmitterModule.forRoot(),
		PoolsModule,
		WalletsModule,
		TradingModule
	],
	providers: [...CORE_SERVICES, ...SHARED_RESOLVERS]
})
export class CoreModule {}
