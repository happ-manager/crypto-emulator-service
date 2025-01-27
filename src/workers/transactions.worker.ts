import type { ISignal } from "@happ-manager/crypto-api";
import { DataSource, In } from "typeorm";
import { parentPort, workerData } from "worker_threads";

import { createSharedTransactionBuffer } from "../app/analytics/utils/create-shared-transaction-buffer.util";
import { DATA_ENTITIES } from "../app/data/entities";
import { TransactionEntity } from "../app/data/entities/transaction.entity";
import { environment } from "../environments/environment";

export async function processTransactions(data?: any) {
	if (!workerData && !data) {
		return;
	}

	const { index, signals } = workerData || data;

	console.log(`Transactions worker ${index + 1} started`);

	const datasource = new DataSource({
		type: "postgres",
		host: environment.database.host,
		port: environment.database.port,
		username: environment.database.username,
		password: environment.database.password,
		database: environment.database.name,
		entities: [...DATA_ENTITIES],
		synchronize: false
	});

	await datasource.initialize();

	const poolAddresses = signals.map((signal: ISignal) => signal.poolAddress);

	const transactions = await datasource.getRepository(TransactionEntity).find({
		where: {
			poolAddress: In(poolAddresses)
		},
		select: ["poolAddress", "price", "date"] // Оставляем только нужные поля
	});

	const { buffer, poolAddresses: stringData, length } = createSharedTransactionBuffer(transactions);

	console.log(`Transactions worker ${index + 1} finished`);

	parentPort?.postMessage({ buffer, stringData, length });
	return { buffer, stringData, length };
}

// processTransactions().catch((error) => {
// 	// console.error(error);
// 	parentPort?.postMessage({ error: error.message });
// });

// export default processTransactions;
export default processTransactions;
