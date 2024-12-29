import { CheckStrategyService } from "./check-strategy.service";
import { ConditionsService } from "./conditions.service";
import { ConditionsGroupsService } from "./conditions-groups.service";
import { FibonacciService } from "./fibonacci.service";
import { MilestonesService } from "./milestones.service";
import { StrategiesService } from "./strategies.service";

export const STRATEGIES_SERVICES = [
	StrategiesService,
	MilestonesService,
	ConditionsService,
	ConditionsGroupsService,
	CheckStrategyService,
	FibonacciService
];
