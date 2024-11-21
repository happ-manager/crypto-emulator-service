import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateStrategyDto } from "../../dtos/strategies/create-strategy.dto";
import { UpdateStrategyDto } from "../../dtos/strategies/update-strategy.dto";
import { PaginatedStrategies, StrategyEntity } from "../../entities/strategy.entity";
import { StrategiesService } from "../../services/strategies.service";

@Resolver(() => StrategyEntity)
export class StrategiesResolver {
	constructor(private readonly strategiesService: StrategiesService) {}

	@Query(() => PaginatedStrategies)
	async strategies(@Args() args: PaginationArgs) {
		return this.strategiesService.getStrategies(args);
	}

	@Query(() => StrategyEntity)
	async strategy(@Args() args: IdArgs) {
		const { id } = args;
		return this.strategiesService.getStrategy({ where: { id } });
	}

	@Mutation(() => StrategyEntity)
	async createStrategy(@Args("strategy") strategy: CreateStrategyDto) {
		return this.strategiesService.createStrategy(strategy);
	}

	@Mutation(() => StrategyEntity)
	async updateStrategy(@Args("strategy") strategy: UpdateStrategyDto) {
		const { id, ...data } = strategy;
		return this.strategiesService.updateStrategy(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteStrategy(@Args("id") id: string) {
		return this.strategiesService.deleteStrategy(id);
	}
}
