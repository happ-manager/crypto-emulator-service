import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { LoggerModule } from "../libs/logger";
import { SolanaModule } from "../libs/solana";
import { TOKENS_CONTROLLERS } from "./controllers";
import { TOKENS_ENTITIES } from "./entities";
import { TOKENS_GUARDS } from "./guards";
import { TOKENS_LOADERS } from "./loaders";
import { TOKENS_RESOLVERS } from "./resolvers";
import { TOKENS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(TOKENS_ENTITIES), EventsModule.forChild(), LoggerModule.forChild(), SolanaModule],
	controllers: TOKENS_CONTROLLERS,
	providers: [...TOKENS_SERVICES, ...TOKENS_RESOLVERS, ...TOKENS_GUARDS, ...TOKENS_LOADERS],
	exports: [...TOKENS_SERVICES, ...TOKENS_LOADERS]
})
export class TokensModule {}
