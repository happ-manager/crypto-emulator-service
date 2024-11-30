import type { ITransaction } from "../../candles/interfaces/transaction.interface";

export function getDelayedTransaction(
	transactions: ITransaction[],
	baseTransaction: ITransaction,
	delay: number
): ITransaction {
	if (delay === 0) {
		return baseTransaction;
	}

	// Вычисляем границы промежутка времени
	const startTime = baseTransaction.date;
	const endTime = baseTransaction.date.add(delay, "millisecond");

	// Фильтруем транзакции, которые попадают в этот промежуток
	const transactionsInDelay = transactions.filter(
		(transaction) => transaction.date.isAfter(startTime) && transaction.date.isSameOrBefore(endTime)
	);

	// Если есть транзакции в промежутке, возвращаем последнюю из них
	if (transactionsInDelay.length > 0) {
		return transactionsInDelay.at(-1);
	}

	// Если транзакций в промежутке нет, возвращаем базовую транзакцию
	return baseTransaction;
}
