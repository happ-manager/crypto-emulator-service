import { ConditionResolver } from "./conditions/condition.resolver";
import { ConditionsResolver } from "./conditions/conditions.resolver";
import { ConditionsGroupResolver } from "./conditions-groups/condition-group.resolver";
import { ConditionsGroupsResolver } from "./conditions-groups/conditions-groups.resolver";
import { MilestoneResolver } from "./milestones/milestone.resolver";
import { MilestonesResolver } from "./milestones/milestones.resolver";
import { StrategiesResolver } from "./strategies/strategies.resolver";
import { StrategyResolver } from "./strategies/strategy.resolver";

export const STRATEGIES_RESOLVERS = [
	StrategyResolver,
	StrategiesResolver,
	MilestonesResolver,
	MilestoneResolver,
	ConditionsResolver,
	ConditionResolver,
	ConditionsGroupsResolver,
	ConditionsGroupResolver
];
