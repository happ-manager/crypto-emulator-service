import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ANALYTCIS } from "../constants/analytics.constant";
import { ANALYTCIS_ENDPOINTS } from "../constants/analytics-endpoints.constant";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { AnalyticsNewService } from "../services/analytics-new.service";

@ApiTags(ANALYTCIS)
@Controller(ANALYTCIS_ENDPOINTS.BASE)
export class AnalyticsController {
	constructor(private readonly _analyticsService: AnalyticsNewService) {}

	@Post(ANALYTCIS_ENDPOINTS.BASE)
	async analsye(@Body() body: GenerateSettingsDto) {
		return this._analyticsService.analyse(body);
	}

	@Post(ANALYTCIS_ENDPOINTS.CLEAR_CACHE)
	async clearCache() {
		// return this._analyticsService.clearCache();
	}
}
