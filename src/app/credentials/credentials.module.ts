import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LoggerModule } from "../libs/logger";
import { CREDENTIALS_CONTROLLERS } from "./controllers";
import { CREDENTIALS_ENTITIES } from "./entities";
import { CREDENTIALS_GUARDS } from "./guards";
import { CREDENTIALS_LOADERS } from "./loaders";
import { CREDENTIALS_RESOLVERS } from "./resolvers";
import { CREDENTIALS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(CREDENTIALS_ENTITIES), LoggerModule.forChild()],
	controllers: CREDENTIALS_CONTROLLERS,
	providers: [...CREDENTIALS_SERVICES, ...CREDENTIALS_RESOLVERS, ...CREDENTIALS_GUARDS, ...CREDENTIALS_LOADERS],
	exports: [...CREDENTIALS_SERVICES, ...CREDENTIALS_LOADERS]
})
export class CredentialsModule {}
