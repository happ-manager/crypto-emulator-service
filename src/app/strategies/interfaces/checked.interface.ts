import type { ITransaction } from "../../candles/interfaces/transaction.interface";
import type { ICondition } from "./condition.interface";
import type { IConditionsGroup } from "./conditions-group.interface";
import type { IMilestone } from "./milestone.interface";

export type IChecked<T> = T & {
	checkedTransaction: ITransaction;
	checkedMilestones?: IChecked<IMilestone>[];
	checkedConditionsGroups?: IChecked<IConditionsGroup>[];
	checkedConditions?: IChecked<ICondition>[];
	delayedTransaction?: ITransaction;
};
