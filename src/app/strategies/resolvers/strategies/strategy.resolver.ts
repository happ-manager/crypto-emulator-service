import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { MilestoneEntity } from "../../entities/milestone.entity";
import { StrategyEntity } from "../../entities/strategy.entity";

@Resolver(() => StrategyEntity)
export class StrategyResolver {
	@ResolveField(() => [MilestoneEntity], { nullable: true })
	async milestones(
		@Parent() strategy: StrategyEntity,
		@Loaders() loaders: ILoaders
	): Promise<MilestoneEntity[] | null> {
		return loaders.getMilestonesByStrategy.load(strategy.id);
	}
}
