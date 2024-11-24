import type { ITransaction } from "../../candles/interfaces/transaction.interface";

export function getDelayedTransaction(
	transactions: ITransaction[],
	baseTransaction: ITransaction,
	delay: number
): ITransaction {
	return transactions.find((transaction) =>
		transaction.date.isSameOrAfter(baseTransaction.date.add(delay, "millisecond"))
	);
}
