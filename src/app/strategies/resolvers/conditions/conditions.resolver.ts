import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateConditionDto } from "../../dtos/conditions/create-condition.dto";
import { UpdateConditionDto } from "../../dtos/conditions/update-condition.dto";
import { ConditionEntity, PaginatedConditions } from "../../entities/condition.entity";
import { ConditionsService } from "../../services/conditions.service";

@Resolver(() => ConditionEntity)
export class ConditionsResolver {
	constructor(private readonly conditionsService: ConditionsService) {}

	@Query(() => PaginatedConditions)
	async conditions(@Args() args: PaginationArgs) {
		return this.conditionsService.getConditions(args);
	}

	@Query(() => ConditionEntity)
	async condition(@Args() args: IdArgs) {
		const { id } = args;
		return this.conditionsService.getCondition({ where: { id } });
	}

	@Mutation(() => ConditionEntity)
	async createCondition(@Args("condition") condition: CreateConditionDto) {
		return this.conditionsService.createCondition(condition);
	}

	@Mutation(() => ConditionEntity)
	async updateCondition(@Args("condition") condition: UpdateConditionDto) {
		const { id, ...data } = condition;
		return this.conditionsService.updateCondition(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteCondition(@Args("id") id: string) {
		return this.conditionsService.deleteCondition(id);
	}
}
