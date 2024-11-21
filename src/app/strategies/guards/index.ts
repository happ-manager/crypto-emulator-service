import { AccessConditionGuard } from "./conditions/access-condition.guard";
import { CreateConditionGuard } from "./conditions/create-condition.guard";
import { AccessConditionsGroupGuard } from "./conditions-groups/access-condition-group.guard";
import { CreateConditionsGroupGuard } from "./conditions-groups/create-condition-group.guard";
import { AccessMilestoneGuard } from "./milestones/access-milestone.guard";
import { CreateMilestoneGuard } from "./milestones/create-milestone.guard";
import { AccessStrategyGuard } from "./strategies/access-strategy.guard";
import { CreateStrategyGuard } from "./strategies/create-strategy.guard";

export const STRATEGIES_GUARDS = [
	CreateStrategyGuard,
	AccessStrategyGuard,
	CreateMilestoneGuard,
	AccessMilestoneGuard,
	CreateConditionsGroupGuard,
	AccessConditionsGroupGuard,
	CreateConditionGuard,
	AccessConditionGuard
];
