import { Injectable } from "@nestjs/common";

import type { ITransaction } from "../../candles/interfaces/transaction.interface";
import { LoggerService } from "../../libs/logger";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { ICondition } from "../interfaces/condition.interface";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import type { IRefs } from "../interfaces/refs.interface";
import { getCheckedTransaction } from "../utils/get-checked-transaction.util";
import { getGroupOperatorValue } from "../utils/get-group-operator-value.util";
import { getOperatorValue } from "../utils/get-operator-value.util";

@Injectable()
export class CheckStrategyService {
	constructor(private readonly _loggerService: LoggerService) {}

	getCheckedMilestone(milestone: IMilestone, transactions: ITransaction[], refs: IRefs) {
		const refId = milestone.refMilestone?.id;

		if (!refId) {
			this._loggerService.error("У группа должна быть ссылка");
			return;
		}

		const refTransaction = refs[refId];

		if (!refTransaction) {
			return;
		}

		const milestoneTransactions = transactions.filter((transaction) => transaction.date.isAfter(refTransaction.date));

		const conditionsGroups = milestone.conditionsGroups.map((group) =>
			this.getCheckedConditionsGroup(group, milestoneTransactions, refs)
		);

		const checkedConditionsGroups = getGroupOperatorValue(conditionsGroups, milestone.groupOperator);

		if (checkedConditionsGroups.length === 0) {
			return;
		}

		const checkedTransaction = getCheckedTransaction(checkedConditionsGroups, milestone.groupOperator);

		refs[milestone.id] = checkedTransaction;

		return { ...milestone, checkedConditionsGroups, checkedTransaction };
	}

	getCheckedConditionsGroup(conditionsGroup: IConditionsGroup, transactions: ITransaction[], refs: IRefs) {
		const refId = conditionsGroup.refMilestone?.id || conditionsGroup.refConditionsGroup?.id;

		if (!refId) {
			this._loggerService.error("Для условия нужная транзакция");
			return;
		}

		const refTransaction = refs[refId];

		if (!refTransaction) {
			this._loggerService.error("Неправильный порядок условий");
			return;
		}

		const groupTransactions = transactions.filter((transaction) => transaction.date.isAfter(refTransaction.date));

		const conditions = conditionsGroup.conditions.map((condition) =>
			this.getCheckedConditon(condition, groupTransactions, conditionsGroup.duration, refs)
		);

		const checkedConditions = getGroupOperatorValue(conditions, conditionsGroup.groupOperator);

		if (checkedConditions.length === 0) {
			return;
		}

		const checkedTransaction = getCheckedTransaction(checkedConditions, conditionsGroup.groupOperator);

		refs[conditionsGroup.id] = checkedTransaction;

		return { ...conditionsGroup, checkedConditions, checkedTransaction };
	}

	getCheckedConditon(condition: ICondition, transactions: ITransaction[], groupDuration: number, refs: IRefs) {
		const refId = condition.refMilestone?.id || condition.refConditionsGroup?.id;

		if (!refId) {
			this._loggerService.error("Для условия нужная транзакция");
			return;
		}

		const refTransaction = refs[refId];

		if (!refTransaction) {
			this._loggerService.error("Неправильный порядок условий");
			return;
		}

		const isPercent = condition.value.includes("%");
		const conditioValue = Number.parseInt(condition.value);

		if (typeof conditioValue !== "number") {
			this._loggerService.error("Неправильный формат значения");
			return;
		}

		// Нам нужна только безпрерывна последовательность подходящих транзакций. Если между успешными транзакциями была неподходящяя - они будут в разных массивах
		const group: ITransaction[][] = [[]];
		let groupIndex = 0;
		let checkedTransaction: ITransaction;

		for (const transaction of transactions) {
			let transactionValue: number;

			if (condition.field === ConditionFieldEnum.DATE) {
				transactionValue = transaction.date.unix() - refTransaction.date.unix();
			} else if (condition.field === ConditionFieldEnum.PRICE) {
				transactionValue = isPercent
					? transaction.price.percentDiff(refTransaction.price).toNumber()
					: transaction.price.minus(refTransaction.price).toNumber();
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
