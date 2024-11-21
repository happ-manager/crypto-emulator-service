import { Module } from "@nestjs/common";

import { DateModule } from "../libs/date";
import { DexToolsModule } from "../libs/dex-tools";
import { ExcelModule } from "../libs/excel";
import { LoggerModule } from "../libs/logger";
import { SignalsModule } from "../signals/signals.module";
import { ANALYTICS_CONTROLLERS } from "./controllers";
import { ANALYTICS_SERVICES } from "./services";

@Module({
	controllers: ANALYTICS_CONTROLLERS,
	imports: [
		SignalsModule,
		DexToolsModule.forChild(),
		DateModule.forChild(),
		ExcelModule.forChild(),
		LoggerModule.forChild()
	],
	providers: ANALYTICS_SERVICES
})
export class AnalyticsModule {}
