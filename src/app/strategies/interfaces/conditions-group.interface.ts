import type { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { ICondition } from "./condition.interface";
import type { IMilestone } from "./milestone.interface";

export interface IConditionsGroup {
	id: string;
	conditions: ICondition[];
	milestone: IMilestone;
	groupOperator: GroupOperatorEnum;
	duration: number;
}
