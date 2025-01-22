import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DATA_ENTITIES } from "./entities";
import { DATA_SERVICES } from "./services";

@Module({
	imports: [TypeOrmModule.forFeature(DATA_ENTITIES)],
	providers: DATA_SERVICES,
	exports: DATA_SERVICES
})
export class DataModule {}
