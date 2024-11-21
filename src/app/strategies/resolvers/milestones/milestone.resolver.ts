import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { ConditionsGroupEntity } from "../../entities/conditions-group.entity";
import { MilestoneEntity } from "../../entities/milestone.entity";
import { StrategyEntity } from "../../entities/strategy.entity";

@Resolver(() => MilestoneEntity)
export class MilestoneResolver {
	@ResolveField(() => StrategyEntity, { nullable: true })
	async strategy(@Parent() milestone: MilestoneEntity, @Loaders() loaders: ILoaders): Promise<StrategyEntity | null> {
		return loaders.getStrategiesByMilestone.load(milestone.id);
	}

	@ResolveField(() => ConditionsGroupEntity, { nullable: true })
	async conditionsGroups(
		@Parent() milestone: MilestoneEntity,
		@Loaders() loaders: ILoaders
	): Promise<ConditionsGroupEntity[] | null> {
		return loaders.getConditionsGroupByMilestone.load(milestone.id);
	}
}
