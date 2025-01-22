import { Module } from "@nestjs/common";

import { DataModule } from "../data/data.module";
import { ANALYTICS_CONTROLLERS } from "./controllers";
import { ANALYTICS_SERVICES } from "./services";

@Module({
	imports: [DataModule],
	controllers: ANALYTICS_CONTROLLERS,
	providers: [...ANALYTICS_SERVICES]
})
export class AnalyticsModule {}
