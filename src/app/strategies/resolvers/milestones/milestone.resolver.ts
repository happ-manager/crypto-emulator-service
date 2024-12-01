import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { ConditionsGroupEntity } from "../../entities/conditions-group.entity";
import { MilestoneEntity } from "../../entities/milestone.entity";
import { StrategyEntity } from "../../entities/strategy.entity";

@Resolver(() => MilestoneEntity)
export class MilestoneResolver {
	@ResolveField(() => StrategyEntity)
	async strategy(@Parent() milestone: MilestoneEntity, @Loaders() loaders: ILoaders) {
		return loaders.getStrategiesByMilestones.load(milestone.id);
	}

	@ResolveField(() => ConditionsGroupEntity)
	async conditionsGroups(@Parent() milestone: MilestoneEntity, @Loaders() loaders: ILoaders) {
		return loaders.getConditionsGroupsByMilestones.load(milestone.id);
	}
}
