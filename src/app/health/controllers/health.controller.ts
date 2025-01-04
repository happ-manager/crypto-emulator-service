import { Controller, Get } from "@nestjs/common";

import { HEALTH_ENDPOINTS } from "../constants/health-endpoints.constant";
import { HealthService } from "../services/health.service";

@Controller(HEALTH_ENDPOINTS.BASE)
export class HealthController {
	constructor(private readonly _healthService: HealthService) {}

	@Get(HEALTH_ENDPOINTS.CHECK)
	check() {
		return this._healthService.check();
	}
}
