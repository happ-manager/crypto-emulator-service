import { ConditionsService } from "./conditions.service";
import { ConditionsGroupsService } from "./conditions-groups.service";
import { MilestonesService } from "./milestones.service";
import { StrategiesService } from "./strategies.service";

export const STRATEGIES_SERVICES = [StrategiesService, MilestonesService, ConditionsService, ConditionsGroupsService];
