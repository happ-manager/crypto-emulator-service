import { ConditionsLoader } from "./conditions.loader";
import { ConditionsGroupsLoader } from "./conditions-groups.loader";
import { MilestonesLoader } from "./milestones.loader";
import { StrategiesLoader } from "./strategies.loader";

export const STRATEGIEST_LOADERS = [StrategiesLoader, MilestonesLoader, ConditionsGroupsLoader, ConditionsLoader];
