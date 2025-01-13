import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { STRATEGIES_CONTROLLERS } from "./controllers";
import { STRATEGIES_ENTITIES } from "./entities";
import { STRATEGIEST_LOADERS } from "./loaders";
import { STRATEGIES_RESOLVERS } from "./resolvers";
import { STRATEGIES_SERVICES } from "./services";

@Module({
	controllers: STRATEGIES_CONTROLLERS,
	imports: [TypeOrmModule.forFeature(STRATEGIES_ENTITIES)],
	providers: [...STRATEGIES_SERVICES, ...STRATEGIES_RESOLVERS, ...STRATEGIEST_LOADERS],
	exports: [...STRATEGIEST_LOADERS, ...STRATEGIES_SERVICES]
})
export class StrategiesModule {}
