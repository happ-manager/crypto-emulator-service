import type { IBase } from "../../shared/interfaces/base.interface";
import type { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { ICondition } from "./condition.interface";
import type { IMilestone } from "./milestone.interface";

export interface IConditionsGroup extends IBase {
	id: string;
	name?: string;
	description?: string;
	groupOperator: GroupOperatorEnum;
	duration: number;
	conditions: ICondition[];
	milestone: IMilestone;
	refMilestone?: IMilestone;
	refConditionsGroup?: IConditionsGroup;
}
