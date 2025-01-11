import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import type { IMilestone } from "./milestone.interface";
import type { IStrategy } from "./strategy.interface";

export type ICheckedTransactions = Map<string, IBaseTransaction>;

export interface ICheckedStrategy extends IChecked<IStrategy> {
	checkedMilestones: IChecked<IMilestone>[];
}

export type IChecked<T> = T & {
	checkedTransaction?: IBaseTransaction;
	delayedTransaction?: IBaseTransaction;
};
