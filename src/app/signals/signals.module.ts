import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { DateModule } from "../libs/date";
import { LoggerModule } from "../libs/logger";
import { SIGNALS_CONTROLLERS } from "./controllers";
import { SIGNALS_ENTITIES } from "./entities";
import { SIGNALS_GUARDS } from "./guards";
import { SIGNALS_LOADERS } from "./loaders";
import { SIGNALS_RESOLVERS } from "./resolvers";
import { SIGNALS_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature(SIGNALS_ENTITIES),
		EventsModule.forChild(),
		DateModule.forChild(),
		LoggerModule.forChild()
	],
	controllers: SIGNALS_CONTROLLERS,
	providers: [...SIGNALS_SERVICES, ...SIGNALS_RESOLVERS, ...SIGNALS_GUARDS, ...SIGNALS_LOADERS],
	exports: [...SIGNALS_SERVICES, ...SIGNALS_LOADERS]
})
export class SignalsModule {}
