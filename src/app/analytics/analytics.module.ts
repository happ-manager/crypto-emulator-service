import { Module } from "@nestjs/common";

import { CandlesModule } from "../candles/candles.module";
import { LoggerModule } from "../libs/logger";
import { SignalsModule } from "../signals/signals.module";
import { ANALYTICS_CONTROLLERS } from "./controllers";
import { ANALYTICS_SERVICES } from "./services";

@Module({
	controllers: ANALYTICS_CONTROLLERS,
	imports: [LoggerModule.forChild(), SignalsModule, CandlesModule],
	providers: ANALYTICS_SERVICES
})
export class AnalyticsModule {}
