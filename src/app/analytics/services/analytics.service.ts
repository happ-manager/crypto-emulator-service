import { type ISignal, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { Worker } from "worker_threads";

import { TransactionEntity } from "../../data/entities/transaction.entity";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { TransactionsService } from "../../data/services/transactions.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";
import { generateSettings } from "../utils/generate-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService,
		private readonly _transactionsService: TransactionsService
	) {}

	async analyse(body?: IGenerateSettingsProps) {
		const { signalsSkip = 0, signalsTake = 5 } = body;

		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});
		const signals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		const allSettings = generateSettings(body);
		const settingsChunks = chunkArray(allSettings, 500);

		const getTransactionDate = Date.now();

		const transactionsMap = await this.getTransactions(signals);
		const workerPromises = settingsChunks.map((settings, index) =>
			runWorker({ index, strategy, signals, settings, transactionsMap })
		);
		console.log(
			`Settings length: ${allSettings.length}. \nSignals length: ${signals.length} \nGet transactions in ${(Date.now() - getTransactionDate) / 1000}`
		);

		const workersStart = Date.now();

		const results = (await Promise.all(workerPromises)).flat();

		console.log(`Results length: ${results.length} in ${(Date.now() - workersStart) / 1000}`);

		return results.reduce((best, current) =>
			current.strategyResult?.totalProfit > best.strategyResult?.totalProfit ? current : best
		);
	}

	async getTransactions(signals: ISignal[]) {
		const poolAddresses = signals.map((signal) => signal.poolAddress);
		const allTransactions = await this._transactionsService.getTransactions({
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
}
