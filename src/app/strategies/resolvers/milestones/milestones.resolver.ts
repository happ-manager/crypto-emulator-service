import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateMilestoneDto } from "../../dtos/milestones/create-milestone.dto";
import { UpdateMilestoneDto } from "../../dtos/milestones/update-milestone.dto";
import { MilestoneEntity, PaginatedMilestones } from "../../entities/milestone.entity";
import { MilestonesService } from "../../services/milestones.service";

@Resolver(() => MilestoneEntity)
export class MilestonesResolver {
	constructor(private readonly milestonesService: MilestonesService) {}

	@Query(() => PaginatedMilestones)
	async milestones(@Args() args: PaginationArgs) {
		return this.milestonesService.getMilestones(args);
	}

	@Query(() => MilestoneEntity)
	async milestone(@Args() args: IdArgs) {
		const { id } = args;
		return this.milestonesService.getMilestone({ where: { id } });
	}

	@Mutation(() => MilestoneEntity)
	async createMilestone(@Args("milestone") milestone: CreateMilestoneDto) {
		return this.milestonesService.createMilestone(milestone);
	}

	@Mutation(() => MilestoneEntity)
	async updateMilestone(@Args("milestone") milestone: UpdateMilestoneDto) {
		const { id, ...data } = milestone;
		return this.milestonesService.updateMilestone(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteMilestone(@Args("id") id: string) {
		return this.milestonesService.deleteMilestone(id);
	}
}
