import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CryptoModule } from "../libs/crypto";
import { SolanaModule } from "../libs/solana";
import { WALLETS_CONTROLLERS } from "./controllers";
import { WALLETS_ENTITIES } from "./entities";
import { WALLETS_GUARDS } from "./guards";
import { WALLETS_LOADERS } from "./loaders";
import { WALLETS_RESOLVERS } from "./resolvers";
import { WALLETS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(WALLETS_ENTITIES), CryptoModule.forChild(), SolanaModule],
	controllers: WALLETS_CONTROLLERS,
	providers: [...WALLETS_SERVICES, ...WALLETS_RESOLVERS, ...WALLETS_GUARDS, ...WALLETS_LOADERS],
	exports: [...WALLETS_SERVICES, ...WALLETS_LOADERS]
})
export class WalletsModule {}
