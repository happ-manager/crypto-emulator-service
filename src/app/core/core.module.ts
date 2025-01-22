import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AnalyticsModule } from "../analytics/analytics.module";
import { EmulatorModule } from "../emulator/emulator.module";
import { TYPEORM_CONFIG } from "./configs/typeorm.config";

@Module({
	imports: [TypeOrmModule.forRoot(TYPEORM_CONFIG), EventEmitterModule.forRoot(), AnalyticsModule, EmulatorModule]
})
export class CoreModule {}
