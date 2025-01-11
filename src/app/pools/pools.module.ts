import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { LoggerModule } from "../libs/logger";
import { POOLS_CONTROLLERS } from "./controllers";
import { POOLS_ENTITIES } from "./entities";
import { POOLS_GUARDS } from "./guards";
import { POOLS_LOADERS } from "./loaders";
import { POOLS_RESOLVERS } from "./resolvers";
import { POOLS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(POOLS_ENTITIES), EventsModule.forChild(), LoggerModule.forChild()],
	controllers: POOLS_CONTROLLERS,
	providers: [...POOLS_SERVICES, ...POOLS_RESOLVERS, ...POOLS_GUARDS, ...POOLS_LOADERS],
	exports: [...POOLS_SERVICES, ...POOLS_LOADERS]
})
export class PoolsModule {}
