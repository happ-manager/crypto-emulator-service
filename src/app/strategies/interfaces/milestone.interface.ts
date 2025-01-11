import type { IBase } from "../../shared/interfaces/base.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import type { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { MilestoneTypeEnum } from "../enums/milestone-type.enum";
import type { ICheckedTransactions } from "./checked.interface";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IStrategy } from "./strategy.interface";

export interface ICheckedProps {
	strategy: IStrategy;
	milestone: IMilestone;
	transactions: IBaseTransaction[];
	checkedTransactions: ICheckedTransactions;
}

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
