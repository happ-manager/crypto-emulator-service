import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { percentDiff } from "../../shared/utils/price.util";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { ICondition } from "../interfaces/condition.interface";

export function getTransactionValue(
	condition: ICondition,
	transaction: IBaseTransaction,
	refTransaction: IBaseTransaction
) {
	if (condition.field === ConditionFieldEnum.DATE) {
		return transaction.date.getTime();
	}

	if (condition.field === ConditionFieldEnum.PRICE) {
		return transaction.price;
	}

	if (condition.field === ConditionFieldEnum.AUTHOR) {
		return transaction.author;
	}

	if (condition.field === ConditionFieldEnum.DATE_DIFF) {
		return transaction.date.getTime() - refTransaction.date.getTime();
	}

	if (condition.field === ConditionFieldEnum.PRICE_DIFF) {
		return condition.value.includes("%")
			? percentDiff(transaction.price, refTransaction.price)
			: transaction.price - refTransaction.price;
	}
}
