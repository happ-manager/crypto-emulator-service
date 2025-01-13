import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { POOLS_CONTROLLERS } from "./controllers";
import { POOLS_ENTITIES } from "./entities";
import { POOLS_GUARDS } from "./guards";
import { POOLS_RESOLVERS } from "./resolvers";
import { POOLS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(POOLS_ENTITIES)],
	controllers: POOLS_CONTROLLERS,
	providers: [...POOLS_SERVICES, ...POOLS_RESOLVERS, ...POOLS_GUARDS],
	exports: [...POOLS_SERVICES]
})
export class PoolsModule {}
