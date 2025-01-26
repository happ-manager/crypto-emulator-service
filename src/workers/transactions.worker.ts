import type { ISignal } from "@happ-manager/crypto-api";
import { DataSource, In } from "typeorm";
import { parentPort, workerData } from "worker_threads";

import { DATA_ENTITIES } from "../app/data/entities";
import { TransactionEntity } from "../app/data/entities/transaction.entity";
import { environment } from "../environments/environment";

async function processTransactions() {
	const { index, signalsBuffer, signalsData, signalsLength } = workerData;

	const date = Date.now();
	console.log(`Transactions worker ${index + 1} started`);

	// Восстанавливаем сигналы из буфера
	const sharedSignals = new Float64Array(signalsBuffer);
	const signals: ISignal[] = [];

	for (let i = 0; i < signalsLength; i++) {
		signals.push({
			id: signalsData["id"][i],
			source: signalsData["source"][i],
			tokenAddress: signalsData["tokenAddress"][i],
			poolAddress: signalsData["poolAddress"][i],
			signaledAt: new Date(sharedSignals[i]) // Восстанавливаем дату
		} as any);
	}

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

	const allTransactions = await datasource.getRepository(TransactionEntity).find({
		where: {
			poolAddress: In(poolAddresses)
		}
	});

	console.log(`Transactions worker ${index + 1} finished in ${(Date.now() - date) / 1000} seconds`);

	parentPort?.postMessage(allTransactions);
}

processTransactions().catch((error) => {
	parentPort?.postMessage({ error: error.message });
});
