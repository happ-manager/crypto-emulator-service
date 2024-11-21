import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CONDITIONS_GROUPS } from "../constants/conditions-groups/conditions-groups.constant";
import { CONDITIONS_GROUPS_ENDPOINTS } from "../constants/conditions-groups/conditions-groups-endpoints.constant";
import { AccessConditionGuard } from "../guards/conditions/access-condition.guard";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import { ConditionsGroupsService } from "../services/conditions-groups.service";

@ApiTags(CONDITIONS_GROUPS)
@Controller(CONDITIONS_GROUPS_ENDPOINTS.BASE)
export class ConditionsGroupsController {
	constructor(private readonly conditionsGroupsService: ConditionsGroupsService) {}

	@Get(CONDITIONS_GROUPS_ENDPOINTS.GET_CONDITION_GROUP)
	async getConditionsGroup(@Param("id") id: string) {
		return this.conditionsGroupsService.getConditionsGroup({ where: { id } });
	}

	@Get(CONDITIONS_GROUPS_ENDPOINTS.GET_CONDITIONS_GROUPS)
	async getConditionsGroups() {
		return this.conditionsGroupsService.getConditionsGroups();
	}

	@Post(CONDITIONS_GROUPS_ENDPOINTS.CREATE_CONDITION_GROUP)
	@UseGuards(AccessConditionGuard)
	async createConditionsGroup(@Body() conditionsGroup: Partial<IConditionsGroup>) {
		return this.conditionsGroupsService.createConditionsGroup(conditionsGroup);
	}

	@Patch(CONDITIONS_GROUPS_ENDPOINTS.UPDATE_CONDITION_GROUP)
	@UseGuards(AccessConditionGuard)
	async updateConditionsGroup(
		@Param("id") conditionsGroupId: string,
		@Body() conditionsGroup: Partial<IConditionsGroup>
	) {
		return this.conditionsGroupsService.updateConditionsGroup(conditionsGroupId, conditionsGroup);
	}

	@Delete(CONDITIONS_GROUPS_ENDPOINTS.DELETE_CONDITION_GROUP)
	@UseGuards(AccessConditionGuard)
	async deleteConditionsGroup(@Param("id") conditionsGroupId: string) {
		return this.conditionsGroupsService.deleteConditionsGroup(conditionsGroupId);
	}
}
