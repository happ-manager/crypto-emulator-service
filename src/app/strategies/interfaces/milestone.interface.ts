import type { IBase } from "../../shared/interfaces/base.interface";
import type { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { MilestoneTypeEnum } from "../enums/milestone-type.enum";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IStrategy } from "./strategy.interface";

export interface IMilestone extends IBase {
	id: string;
	name?: string;
	description?: string;
	value?: string;
	strategy: IStrategy;
	conditionsGroups: IConditionsGroup[];
	type: MilestoneTypeEnum;
	refMilestone?: IMilestone;
	groupOperator: GroupOperatorEnum;
	position: number;
}
