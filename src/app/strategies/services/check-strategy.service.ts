import { Injectable } from "@nestjs/common";

import { LoggerService } from "../../libs/logger";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { ICheckedTransactions } from "../interfaces/checked.interface";
import type { ICondition } from "../interfaces/condition.interface";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import { getCheckedTransaction } from "../utils/get-checked-transaction.util";
import { getGroupOperatorValue } from "../utils/get-group-operator-value.util";
import { getOperatorValue } from "../utils/get-operator-value.util";

@Injectable()
export class CheckStrategyService {
	constructor(private readonly _loggerService: LoggerService) {}

	getCheckedMilestone(
		milestone: IMilestone,
		transactions: IBaseTransaction[],
		checkedTransactions: ICheckedTransactions
	) {
		if (checkedTransactions[milestone.id]) {
			return { ...milestone, checkedTransaction: checkedTransactions[milestone.id] };
		}

		const refId = milestone.refMilestone?.id;

		if (!refId) {
			this._loggerService.error("У группы должна быть ссылка", "getCheckedMilestone");
			return;
		}

		const refTransaction = checkedTransactions[refId];

		if (!refTransaction) {
			return;
		}

		const milestoneTransactions = transactions.filter((transaction) =>
			transaction.date.isSameOrAfter(refTransaction.date)
		);

		const conditionsGroups = milestone.conditionsGroups.map((group) =>
			this.getCheckedConditionsGroup(group, milestoneTransactions, checkedTransactions)
		);

		const checkedConditionsGroups = getGroupOperatorValue(conditionsGroups, milestone.groupOperator);

		if (checkedConditionsGroups.length === 0) {
			return;
		}

		const checkedTransaction = getCheckedTransaction(checkedConditionsGroups, milestone.groupOperator);

		checkedTransactions[milestone.id] = checkedTransaction;

		return { ...milestone, checkedConditionsGroups, checkedTransaction };
	}

	getCheckedConditionsGroup(
		conditionsGroup: IConditionsGroup,
		transactions: IBaseTransaction[],
		checkedTransactions: ICheckedTransactions
	) {
		const refId = conditionsGroup.refMilestone?.id || conditionsGroup.refConditionsGroup?.id;

		if (!refId) {
			this._loggerService.error("Для условия нужная транзакция", "getCheckedConditionsGroup");
			return;
		}

		const refTransaction = checkedTransactions[refId];

		if (!refTransaction) {
			return;
		}

		const groupTransactions = transactions.filter((transaction) => transaction.date.isSameOrAfter(refTransaction.date));

		const conditions = conditionsGroup.conditions.map((condition) =>
			this.getCheckedConditon(condition, groupTransactions, checkedTransactions, conditionsGroup.duration)
		);

		const checkedConditions = getGroupOperatorValue(conditions, conditionsGroup.groupOperator);

		if (checkedConditions.length === 0) {
			return;
		}

		const checkedTransaction = getCheckedTransaction(checkedConditions, conditionsGroup.groupOperator);

		checkedTransactions[conditionsGroup.id] = checkedTransaction;

		return { ...conditionsGroup, checkedConditions, checkedTransaction };
	}

	getCheckedConditon(
		condition: ICondition,
		transactions: IBaseTransaction[],
		checkedTransactions: ICheckedTransactions,
		groupDuration: number
	) {
		const refId = condition.refMilestone?.id || condition.refConditionsGroup?.id;

		if (!refId) {
			this._loggerService.error("Для условия нужная транзакция", "getCheckedConditon");
			return;
		}

		const refTransaction = checkedTransactions[refId];

		if (!refTransaction) {
			return;
		}

		const isPercent = condition.value.includes("%");
		const conditioValue = Number.parseInt(condition.value);

		if (typeof conditioValue !== "number") {
			this._loggerService.error("Неправильный формат значения", "getCheckedConditon");
			return;
		}

		// Нам нужна только безпрерывна последовательность подходящих транзакций. Если между успешными транзакциями была неподходящяя - они будут в разных массивах
		const group: IBaseTransaction[][] = [[]];
		let groupIndex = 0;
		let checkedTransaction: IBaseTransaction;

		for (const transaction of transactions) {
			let transactionValue: number;

			switch (condition.field) {
				case ConditionFieldEnum.DATE: {
					transactionValue = transaction.date.unix() - refTransaction.date.unix();

					break;
				}
				case ConditionFieldEnum.PRICE: {
					transactionValue = isPercent
						? transaction.price.percentDiff(refTransaction.price).toNumber()
						: transaction.price.minus(refTransaction.price).toNumber();

					break;
				}
				case ConditionFieldEnum.AUTHOR: {
					transactionValue = transaction.author as any as number; // TODO: Check types

					break;
				}
				// No default
			}

			const isChecked = getOperatorValue(transactionValue, conditioValue, condition.operator);

			const groupTransaction = group[groupIndex];

			if (!isChecked) {
				if (groupTransaction.length > 0) {
					group[++groupIndex] = [];
				}
				continue;
			}

			groupTransaction.push(transaction);
			const [firstTransaction] = groupTransaction;
			const duration = transaction.date.unix() - firstTransaction.date.unix();

			if (duration >= groupDuration) {
				checkedTransaction = transaction;
				break;
			}
		}

		if (!checkedTransaction) {
			return;
		}

		return { ...condition, checkedTransaction };
	}
}
