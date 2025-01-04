import { Module } from "@nestjs/common";

import { HEALTH_CONTROLLERS } from "./controllers";
import { HEALTH_SERVICES } from "./services";

@Module({
	controllers: HEALTH_CONTROLLERS,
	providers: HEALTH_SERVICES
})
export class HealthModule {}
