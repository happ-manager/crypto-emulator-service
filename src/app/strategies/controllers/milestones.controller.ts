import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { MILESTONES } from "../constants/milestones/milestones.constant";
import { MILESTONES_ENDPOINTS } from "../constants/milestones/milestones-endpoints.constant";
import { AccessMilestoneGuard } from "../guards/milestones/access-milestone.guard";
import type { IMilestone } from "../interfaces/milestone.interface";
import { MilestonesService } from "../services/milestones.service";

@ApiTags(MILESTONES)
@Controller(MILESTONES_ENDPOINTS.BASE)
export class MilestonesController {
	constructor(private readonly milestonesService: MilestonesService) {}

	@Get(MILESTONES_ENDPOINTS.GET_MILESTONE)
	async getMilestone(@Param("id") id: string) {
		return this.milestonesService.getMilestone({ where: { id } });
	}

	@Get(MILESTONES_ENDPOINTS.GET_MILESTONES)
	async getMilestones() {
		return this.milestonesService.getMilestones();
	}

	@Post(MILESTONES_ENDPOINTS.CREATE_MILESTONE)
	@UseGuards(AccessMilestoneGuard)
	async createMilestone(@Body() milestone: Partial<IMilestone>) {
		return this.milestonesService.createMilestone(milestone);
	}

	@Patch(MILESTONES_ENDPOINTS.UPDATE_MILESTONE)
	@UseGuards(AccessMilestoneGuard)
	async updateMilestone(@Param("id") milestoneId: string, @Body() milestone: Partial<IMilestone>) {
		return this.milestonesService.updateMilestone(milestoneId, milestone);
	}

	@Delete(MILESTONES_ENDPOINTS.DELETE_MILESTONE)
	@UseGuards(AccessMilestoneGuard)
	async deleteMilestone(@Param("id") milestoneId: string) {
		return this.milestonesService.deleteMilestone(milestoneId);
	}
}
