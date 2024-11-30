import type { IBase } from "../../shared/interfaces/base.interface";
import type { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { OperatorEnum } from "../enums/operator.enum";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IMilestone } from "./milestone.interface";

export interface ICondition extends IBase {
	id: string;
	field: ConditionFieldEnum;
	operator: OperatorEnum;
	value: string;
	conditionsGroup: IConditionsGroup;
	refMilestone?: IMilestone;
	refConditionsGroup?: IConditionsGroup;
}
