import type { ITransaction } from "@happ-manager/crypto-api";

export function createSharedTransactionBuffer(transactions: ITransaction[]) {
	// Определяем фиксированный размер для каждого поля
	const BYTES_PER_TRANSACTION = 5 * Float64Array.BYTES_PER_ELEMENT; // Дата, цена, nextPrice (числа)
	const STRING_FIELDS = ["id", "poolAddress", "signature", "author"]; // Поля строк
	const buffer = new SharedArrayBuffer(transactions.length * BYTES_PER_TRANSACTION);

	// Общий буфер для числовых данных
	const sharedTransactions = new Float64Array(buffer);

	// Создаем отдельные маппинги для строк
	const stringData: Record<string, string[]> = {};
	for (const field of STRING_FIELDS) {
		stringData[field] = transactions.map((tx) => tx[field]);
	}

	// Записываем числовые данные
	for (const [index, transaction] of transactions.entries()) {
		const offset = index * 5;
		sharedTransactions[offset] = new Date(transaction.date).getTime(); // UNIX timestamp
		sharedTransactions[offset + 1] = transaction.price;
		sharedTransactions[offset + 2] = transaction.nextPrice;
		sharedTransactions[offset + 3] = index; // Ссылка на строковые маппинги
	}

	return { buffer, stringData, length: transactions.length };
}
