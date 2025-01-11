import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";

export function getDelayedTransaction(
	transactions: IBaseTransaction[],
	baseTransaction: IBaseTransaction,
	delay: number
) {
	if (delay === 0) {
		return baseTransaction;
	}

	// Вычисляем границы промежутка времени
	const startTime = baseTransaction.date;
	const endTime = new Date(baseTransaction.date.getTime() + delay);

	// Фильтруем транзакции, которые попадают в этот промежуток
	const transactionsInDelay = transactions.filter(
		(transaction) => transaction.date > startTime && transaction.date <= endTime
	);

	// Если есть транзакции в промежутке, возвращаем последнюю из них
	if (transactionsInDelay.length > 0) {
		return transactionsInDelay.at(-1);
	}

	// Если транзакций в промежутке нет, возвращаем базовую транзакцию
	return baseTransaction;
}
