import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { STRATEGIES } from "../constants/strategies/strategies.constant";
import { STRATEGIES_ENDPOINTS } from "../constants/strategies/strategies-endpoints.constant";
import { AccessStrategyGuard } from "../guards/strategies/access-strategy.guard";
import type { IStrategy } from "../interfaces/strategy.interface";
import { StrategiesService } from "../services/strategies.service";

@ApiTags(STRATEGIES)
@Controller(STRATEGIES_ENDPOINTS.BASE)
export class StrategiesController {
	constructor(private readonly strategiesService: StrategiesService) {}

	@Get(STRATEGIES_ENDPOINTS.GET_STRATEGY)
	async getStrategy(@Param("id") id: string) {
		return this.strategiesService.getStrategy({
			where: { id },
			relations: this.strategiesService.relations
		});
	}

	@Get(STRATEGIES_ENDPOINTS.GET_STRATEGIES)
	async getStrategies() {
		return this.strategiesService.getStrategies();
	}

	@Post(STRATEGIES_ENDPOINTS.CREATE_STRATEGY)
	@UseGuards(AccessStrategyGuard)
	async createStrategy(@Body() strategy: Partial<IStrategy>) {
		return this.strategiesService.createStrategy(strategy);
	}

	@Patch(STRATEGIES_ENDPOINTS.UPDATE_STRATEGY)
	@UseGuards(AccessStrategyGuard)
	async updateStrategy(@Param("id") strategyId: string, @Body() strategy: Partial<IStrategy>) {
		return this.strategiesService.updateStrategy(strategyId, strategy);
	}

	@Delete(STRATEGIES_ENDPOINTS.DELETE_STRATEGY)
	@UseGuards(AccessStrategyGuard)
	async deleteStrategy(@Param("id") strategyId: string) {
		return this.strategiesService.deleteStrategy(strategyId);
	}

	@Patch(STRATEGIES_ENDPOINTS.RECREATE_STRATEGY)
	@UseGuards(AccessStrategyGuard)
	async recreateStrategy(@Param("id") strategyId: string, @Body() strategy: Partial<IStrategy>) {
		return this.strategiesService.recreateStrategy({ id: strategyId, ...strategy });
	}
}
