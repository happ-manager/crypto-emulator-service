import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module";
import { DateModule } from "../libs/date";
import { LoggerModule } from "../libs/logger";
import { CANDLES_CONTROLLERS } from "./controllers";
import { CANDLES_ENTITIES } from "./entities";
import { CANDLES_GUARDS } from "./guards";
import { CANDLES_LOADERS } from "./loaders";
import { CANDLES_RESOLVERS } from "./resolvers";
import { CANDLES_SERVICES } from "./services";

@Module({
	imports: [
		TypeOrmModule.forFeature(CANDLES_ENTITIES),
		EventsModule.forChild(),
		DateModule.forChild(),
		LoggerModule.forChild()
	],
	controllers: CANDLES_CONTROLLERS,
	providers: [...CANDLES_SERVICES, ...CANDLES_RESOLVERS, ...CANDLES_GUARDS, ...CANDLES_LOADERS],
	exports: [...CANDLES_SERVICES, ...CANDLES_LOADERS]
})
export class CandlesModule {}
