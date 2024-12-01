import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import type { ICondition } from "./condition.interface";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IMilestone } from "./milestone.interface";

export type ICheckedTransactions = Record<string, IBaseTransaction>;

export type IChecked<T> = T & {
	checkedTransaction?: IBaseTransaction;
	delayedTransaction?: IBaseTransaction;
	checkedMilestones?: IChecked<IMilestone>[];
	checkedConditionsGroups?: IChecked<IConditionsGroup>[];
	checkedConditions?: IChecked<ICondition>[];
};
