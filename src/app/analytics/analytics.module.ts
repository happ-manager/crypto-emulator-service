import { Module } from "@nestjs/common";

import { CandlesModule } from "../candles/candles.module";
import { DateModule } from "../libs/date";
import { ExcelModule } from "../libs/excel";
import { LoggerModule } from "../libs/logger";
import { TokensModule } from "../tokens/tokens.module";
import { ANALYTICS_CONTROLLERS } from "./controllers";
import { ANALYTICS_SERVICES } from "./services";

@Module({
	controllers: ANALYTICS_CONTROLLERS,
	imports: [TokensModule, CandlesModule, DateModule.forChild(), ExcelModule.forChild(), LoggerModule.forChild()],
	providers: ANALYTICS_SERVICES
})
export class AnalyticsModule {}
