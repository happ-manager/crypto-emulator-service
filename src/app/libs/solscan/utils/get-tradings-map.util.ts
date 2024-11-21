import { SOLANA_TOKEN, WRAPPED_SOLANA_TOKEN } from "../constants/solana-tokens.constant";
import type { ISolscanTransaction } from "../interfaces/solscan-transaction.interface";

export function getTradingsMap(transactions: ISolscanTransaction[]): Record<string, ISolscanTransaction[]> {
	const solanaTokens = new Set([SOLANA_TOKEN, WRAPPED_SOLANA_TOKEN]);
	// Фильтруем транзакции, исключая SOLANA токены
	const filteredTransactions = transactions.filter((transaction) => !solanaTokens.has(transaction.token_address));

	// Группируем транзакции по token_address
	const tokenGroups = filteredTransactions.reduce<Record<string, ISolscanTransaction[]>>((acc, transaction) => {
		if (!acc[transaction.token_address]) {
			acc[transaction.token_address] = [];
		}
		acc[transaction.token_address].push(transaction);
		return acc;
	}, {});

	// Формируем объект tradings, только если есть и 'inc', и 'dec' транзакции
	const tradings: Record<string, ISolscanTransaction[]> = {};
	for (const [tokenAddress, tokenTransactions] of Object.entries(tokenGroups)) {
		const hasInc = tokenTransactions.some((tx) => tx.change_type === "inc");
		const hasDec = tokenTransactions.some((tx) => tx.change_type === "dec");

		if (hasInc && hasDec) {
			tradings[tokenAddress] = tokenTransactions;
		}
	}

	return tradings;
}
