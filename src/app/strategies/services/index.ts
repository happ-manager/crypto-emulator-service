import { CheckStrategyService } from "./check-strategy.service";
import { ConditionsService } from "./conditions.service";
import { ConditionsGroupsService } from "./conditions-groups.service";
import { MilestonesService } from "./milestones.service";
import { PREDEFINED_STRATEGIES_SERVICES } from "./predefined-strategies";
import { StrategiesService } from "./strategies.service";

export const STRATEGIES_SERVICES = [
	StrategiesService,
	MilestonesService,
	ConditionsService,
	ConditionsGroupsService,
	CheckStrategyService,
	...PREDEFINED_STRATEGIES_SERVICES
];
