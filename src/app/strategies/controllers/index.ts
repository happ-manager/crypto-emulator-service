import { ConditionsController } from "./conditions.controller";
import { ConditionsGroupsController } from "./conditions-groups.controller";
import { MilestonesController } from "./milestones.controller";
import { StrategiesController } from "./strategies.controller";

export const STRATEGIES_CONTROLLERS = [
	MilestonesController,
	ConditionsGroupsController,
	ConditionsController,
	StrategiesController
];
