import { Injectable } from "@nestjs/common";

import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { ICheckedProps } from "../interfaces/milestone.interface";
import { getConditionValue } from "../utils/get-condition-value.util";
import { getOperatorValue } from "../utils/get-operator-value.util";
import { getTransactionValue } from "../utils/get-transaction-value.util";
import { PredefinedStrategiesService } from "./predefined-strategies/predefined-strategies.service";

@Injectable()
export class CheckStrategyService {
	constructor(private readonly _predefinedStrategiesService: PredefinedStrategiesService) {}

	getCheckedTransaction(props: ICheckedProps): IBaseTransaction {
		const { strategy, milestone, transactions, checkedTransactions } = props;

		if (strategy.predefinedStrategy) {
			return this._predefinedStrategiesService.getCheckedTransaction(props);
		}

		if (checkedTransactions.has(milestone.id)) {
			return checkedTransactions.get(milestone.id);
		}

		const transactionsToCheck: IBaseTransaction[] = [];
		let isConditionsGroupsChecked = false;

		for (const transaction of transactions) {
			for (const conditionsGroup of milestone.conditionsGroups) {
				if (checkedTransactions.has(conditionsGroup.id)) {
					continue;
				}

				let isConditionsChecked = false;

				for (const condition of conditionsGroup.conditions) {
					const refId = condition.refMilestone?.id || condition.refConditionsGroup?.id;
					const refTransaction = checkedTransactions.get(refId);

					if (!refTransaction) {
						continue;
					}

					const conditionValue = getConditionValue(condition);
					const transactionValue = getTransactionValue(condition, transaction, refTransaction);
					const isConditionChecked = getOperatorValue(transactionValue, condition.operator, conditionValue);

					if (isConditionChecked) {
						isConditionsChecked = true;
					} else if (conditionsGroup.groupOperator === GroupOperatorEnum.AND) {
						isConditionsChecked = false;
						break;
					}
				}

				if (!isConditionsChecked) {
					isConditionsGroupsChecked = false;
					transactionsToCheck.splice(0, transactionsToCheck.length);

					if (milestone.groupOperator === GroupOperatorEnum.AND) {
						break;
					}

					continue;
				}

				transactionsToCheck.push(transaction);

				const [firstTransaction] = transactionsToCheck;
				const duration = transaction.date.getTime() - firstTransaction.date.getTime();

				if (duration < conditionsGroup.duration) {
					isConditionsGroupsChecked = false;
					continue;
				}

				isConditionsGroupsChecked = true;
				checkedTransactions.set(conditionsGroup.id, transaction);

				if (milestone.groupOperator === GroupOperatorEnum.OR) {
					break;
				}
			}

			if (!isConditionsGroupsChecked) {
				continue;
			}

			return transaction;
		}
	}
}
