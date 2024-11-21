import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { DateModule } from "../libs/date";
import { DexToolsModule } from "../libs/dex-tools";
import { LoggerModule } from "../libs/logger";
import { TOKENS_CONTROLLERS } from "./controllers";
import { TOKENS_ENTITIES } from "./entities";
import { TOKENS_GUARDS } from "./guards";
import { TOKENS_LOADERS } from "./loaders";
import { TOKENS_RESOLVERS } from "./resolvers";
import { TOKENS_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature(TOKENS_ENTITIES),
		DexToolsModule.forChild(),
		EventsModule.forChild(),
		DateModule.forChild(),
		LoggerModule.forChild()
	],
	controllers: TOKENS_CONTROLLERS,
	providers: [...TOKENS_SERVICES, ...TOKENS_RESOLVERS, ...TOKENS_GUARDS, ...TOKENS_LOADERS],
	exports: [...TOKENS_SERVICES, ...TOKENS_LOADERS]
})
export class TokensModule {}
