import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CONDITIONS } from "../constants/conditions/conditions.constant";
import { CONDITIONS_ENDPOINTS } from "../constants/conditions/conditions-endpoints.constant";
import { AccessConditionGuard } from "../guards/conditions/access-condition.guard";
import type { ICondition } from "../interfaces/condition.interface";
import { ConditionsService } from "../services/conditions.service";

@ApiTags(CONDITIONS)
@Controller(CONDITIONS_ENDPOINTS.BASE)
export class ConditionsController {
	constructor(private readonly conditionsService: ConditionsService) {}

	@Get(CONDITIONS_ENDPOINTS.GET_CONDITION)
	async getCondition(@Param("id") id: string) {
		return this.conditionsService.getCondition({ where: { id } });
	}

	@Get(CONDITIONS_ENDPOINTS.GET_CONDITIONS)
	async getConditions() {
		return this.conditionsService.getConditions();
	}

	@Post(CONDITIONS_ENDPOINTS.CREATE_CONDITION)
	@UseGuards(AccessConditionGuard)
	async createCondition(@Body() condition: Partial<ICondition>) {
		return this.conditionsService.createCondition(condition);
	}

	@Patch(CONDITIONS_ENDPOINTS.UPDATE_CONDITION)
	@UseGuards(AccessConditionGuard)
	async updateCondition(@Param("id") conditionId: string, @Body() condition: Partial<ICondition>) {
		return this.conditionsService.updateCondition(conditionId, condition);
	}

	@Delete(CONDITIONS_ENDPOINTS.DELETE_CONDITION)
	@UseGuards(AccessConditionGuard)
	async deleteCondition(@Param("id") conditionId: string) {
		return this.conditionsService.deleteCondition(conditionId);
	}
}
