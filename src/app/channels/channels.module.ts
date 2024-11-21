import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LoggerModule } from "../libs/logger";
import { CHANNELS_CONTROLLERS } from "./controllers";
import { CHANNELS_ENTITIES } from "./entities";
import { CHANNELS_GUARDS } from "./guards";
import { CHANNELS_LOADERS } from "./loaders";
import { CHANNELS_RESOLVERS } from "./resolvers";
import { CHANNELS_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(CHANNELS_ENTITIES), LoggerModule.forChild()],
	controllers: CHANNELS_CONTROLLERS,
	providers: [...CHANNELS_SERVICES, ...CHANNELS_RESOLVERS, ...CHANNELS_GUARDS, ...CHANNELS_LOADERS],
	exports: [...CHANNELS_SERVICES, ...CHANNELS_LOADERS]
})
export class ChannelsModule {}
