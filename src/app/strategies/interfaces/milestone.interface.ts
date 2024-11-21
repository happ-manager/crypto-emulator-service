import type { ActionTypeEnum } from "../enums/action-type.enum";
import type { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IStrategy } from "./strategy.interface";

export interface IMilestone {
	id: string;
	name: string;
	strategy: IStrategy;
	conditionsGroups: IConditionsGroup[];
	actionType: ActionTypeEnum;
	groupOperator: GroupOperatorEnum;
	value: number;
	position: number;
}
