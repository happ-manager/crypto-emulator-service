import { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { IChecked } from "../interfaces/checked.interface";

export function getCheckedTransaction<T>(conditions: IChecked<T>[], groupOperator: GroupOperatorEnum) {
	const { checkedTransaction } = conditions.reduce((a, b) => {
		if (groupOperator === GroupOperatorEnum.AND) {
			// Для оператора AND: находим самое последнее условие
			return a.checkedTransaction.date.isAfter(b.checkedTransaction.date) ? a : b;
		} else if (groupOperator === GroupOperatorEnum.OR) {
			// Для оператора OR: находим самое первое условие
			return a.checkedTransaction.date.isBefore(b.checkedTransaction.date) ? a : b;
		}
	});

	return checkedTransaction;
}
