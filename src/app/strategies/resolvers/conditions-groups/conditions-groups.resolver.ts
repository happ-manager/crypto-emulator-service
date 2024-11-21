import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateConditionDto } from "../../dtos/conditions/create-condition.dto";
import { UpdateConditionDto } from "../../dtos/conditions/update-condition.dto";
import { ConditionsGroupEntity, PaginatedConditionsGroups } from "../../entities/conditions-group.entity";
import { ConditionsGroupsService } from "../../services/conditions-groups.service";

@Resolver(() => ConditionsGroupEntity)
export class ConditionsGroupsResolver {
	constructor(private readonly conditionsGroupsService: ConditionsGroupsService) {}

	@Query(() => PaginatedConditionsGroups)
	async conditionsGroups(@Args() args: PaginationArgs) {
		return this.conditionsGroupsService.getConditionsGroups(args);
	}

	@Query(() => ConditionsGroupEntity)
	async conditionsGroup(@Args() args: IdArgs) {
		const { id } = args;
		return this.conditionsGroupsService.getConditionsGroup({ where: { id } });
	}

	@Mutation(() => ConditionsGroupEntity)
	async createConditionsGroup(@Args("conditionsGroup") conditionsGroup: CreateConditionDto) {
		return this.conditionsGroupsService.createConditionsGroup(conditionsGroup);
	}

	@Mutation(() => ConditionsGroupEntity)
	async updateConditionsGroup(@Args("conditionsGroup") conditionsGroup: UpdateConditionDto) {
		const { id, ...data } = conditionsGroup;
		return this.conditionsGroupsService.updateConditionsGroup(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteConditionsGroup(@Args("id") id: string) {
		return this.conditionsGroupsService.deleteConditionsGroup(id);
	}
}
