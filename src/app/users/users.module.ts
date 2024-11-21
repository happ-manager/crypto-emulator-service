import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LoggerModule } from "../libs/logger";
import { USERS_CONTROLLERS } from "./controllers";
import { USERS_ENTITIES } from "./entities";
import { USERS_GUARDS } from "./guards";
import { USERS_LOADERS } from "./loaders";
import { USERS_RESOLVERS } from "./resolvers";
import { USERS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(USERS_ENTITIES), LoggerModule.forChild()],
	controllers: USERS_CONTROLLERS,
	providers: [...USERS_SERVICES, ...USERS_RESOLVERS, ...USERS_GUARDS, ...USERS_LOADERS],
	exports: [...USERS_SERVICES, ...USERS_LOADERS]
})
export class UsersModule {}
