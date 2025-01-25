import type { ISignal } from "@happ-manager/crypto-api";
import { DataSource, In } from "typeorm";

import { TYPEORM_CONFIG } from "../../core/configs/typeorm.config";
import { TransactionEntity } from "../../data/entities/transaction.entity";

export async function getTransactions(signals: ISignal[]) {
	const dataSource = new DataSource({
		...(TYPEORM_CONFIG as any),
		entities: [TransactionEntity]
	});

	if (!dataSource.isInitialized) {
		await dataSource.initialize();
	}

	const repository = dataSource.getRepository(TransactionEntity);

	const poolAddresses = signals.map((signal) => signal.poolAddress);
	const allTransactions = await repository.find({
		where: { poolAddress: In(poolAddresses) }
	});
	const transactionsMap = new Map<string, TransactionEntity[]>();

	for (const transaction of allTransactions) {
		if (!transactionsMap.has(transaction.poolAddress)) {
			transactionsMap.set(transaction.poolAddress, [transaction]);
			continue;
		}

		transactionsMap.get(transaction.poolAddress).push(transaction);
	}

	return transactionsMap;
}
