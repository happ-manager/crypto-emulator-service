import type { ITransaction } from "@happ-manager/crypto-api";

export function createSharedTransactionBuffer(transactions: ITransaction[]) {
	// Определяем фиксированный размер для каждого поля (3 числа: date, price, poolAddress index)
	const BYTES_PER_TRANSACTION = 3 * Float64Array.BYTES_PER_ELEMENT;

	// Создаем общий буфер для числовых данных
	const buffer = new SharedArrayBuffer(transactions.length * BYTES_PER_TRANSACTION);
	const sharedTransactions = new Float64Array(buffer);

	// Сохраняем poolAddress как отдельный массив строк
	const poolAddresses: string[] = transactions.map((tx) => tx.poolAddress);

	// Заполняем числовые данные
	for (const [index, transaction] of transactions.entries()) {
		const offset = index * 3;
		sharedTransactions[offset] = new Date(transaction.date).getTime(); // Дата в формате UNIX timestamp
		sharedTransactions[offset + 1] = transaction.price; // Цена
		sharedTransactions[offset + 2] = index; // Индекс строки poolAddress
	}

	return { buffer, poolAddresses, length: transactions.length };
}
