import {
	getCheckedTransaction,
	IBaseTransaction,
	IChecked,
	ICheckedStrategy,
	ICheckedTransactions,
	IMilestone,
	ISignal,
	MilestoneTypeEnum
} from "@happ-manager/crypto-api";
import { Injectable, Logger } from "@nestjs/common";
import { In } from "typeorm";

import { TransactionEntity } from "../../data/entities/transaction.entity";
import { TransactionsService } from "../../data/services/transactions.service";
import { findTransaction } from "../../shared/utils/find-transaction.util";
import type { IEmulateBody } from "../interfaces/emulator-body.interface";
import { getDelayedTransaction } from "../utils/get-delayed-transaction.util";

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	return chunks;
}

async function executeInParallel<T>(tasks: (() => Promise<T>)[], parallelLimit: number): Promise<T[]> {
	const results: T[] = [];
	const executing: Promise<void>[] = [];

	for (const [_, task] of tasks.entries()) {
		// Обертываем выполнение задачи для логирования
		const promise = (async () => {
			const result = await task(); // Выполняем задачу
			results.push(result); // Сохраняем результат
		})();

		// Добавляем задачу в список выполняющихся
		executing.push(promise);

		if (executing.length >= parallelLimit) {
			// Дожидаемся завершения одной из выполняющихся задач
			await Promise.race(executing);
		}

		// Убираем завершенные задачи из списка
		// Это делается только после их завершения
		executing.filter((p) => p !== promise);
	}

	// Дожидаемся выполнения всех оставшихся задач
	await Promise.all(executing);
	return results;
}

@Injectable()
export class EmulatorService {
	private readonly _loggerService = new Logger("EmulatorService");

	constructor(private readonly _transactionsService: TransactionsService) {}

	async onModuleInit() {
		// const data = await this._transactionsService.getTransactions({
		// 	take: 100
		// });
		//
		// console.log(data);
	}

	async emulateBySignals(body: IEmulateBody) {
		const { signals, strategies, delay } = body;

		const signalsChunks: ISignal[][] = chunkArray(signals, 100);
		const checkedSignals = [];

		for (const signalsChunk of signalsChunks) {
			const data = await this._transactionsService.getTransactions({
				where: { poolAddress: In(signalsChunk.map((signal) => signal.poolAddress)) },
				order: { date: "asc" }
			});

			const poolTransactions: Record<string, IBaseTransaction[]> = {};

			for (const transaction of data) {
				if (poolTransactions[transaction.poolAddress]) {
					poolTransactions[transaction.poolAddress].push(transaction);
					continue;
				}

				poolTransactions[transaction.poolAddress] = [transaction];
			}

			for (const signal of signalsChunk) {
				const transactions = poolTransactions[signal.poolAddress];
				const checkedStrategies: ICheckedStrategy[] = [];

				const signalTransaction = findTransaction(transactions, new Date(signal.signaledAt));

				if (!signalTransaction) {
					this._loggerService.log("Не получаеся найти транзакцию сигнала");
					continue;
				}

				for (const strategy of strategies) {
					const checkedTransactions: ICheckedTransactions = new Map();
					const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

					if (!signalMilestone) {
						this._loggerService.log("У стратегии должен быть сигнал");
						continue;
					}

					checkedTransactions.set(signalMilestone.id, signalTransaction);

					const checkedMilestones: IChecked<IMilestone>[] = [];
					const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

					for (const milestone of sortedMilestones) {
						const checkedTransaction = getCheckedTransaction({
							strategy,
							milestone,
							transactions,
							checkedTransactions
						});

						if (!checkedTransaction) {
							continue;
						}

						const delayedTransaction = getDelayedTransaction(transactions, checkedTransaction, delay);

						checkedTransactions.set(milestone.id, delayedTransaction);
						checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
					}

					checkedStrategies.push({ ...strategy, checkedMilestones });
				}

				checkedSignals.push({ signal, checkedStrategies });
			}
		}

		return checkedSignals;
	}

	async emulateByStrategies(body: IEmulateBody) {
		const { signals, strategies, delay } = body;

		const transactions = await this.getTransactions(signals);
		const poolTransactions = new Map<string, IBaseTransaction[]>();

		for (const transaction of transactions) {
			if (poolTransactions.has(transaction.poolAddress)) {
				poolTransactions.get(transaction.poolAddress).push(transaction);
				continue;
			}

			poolTransactions.set(transaction.poolAddress, [transaction]);
		}

		const checkedStrategies: any[] = [];

		for (const strategy of strategies) {
			const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

			if (!signalMilestone) {
				this._loggerService.log("У стратегии должен быть сигнал");
				continue;
			}

			const checkedSignals = [];

			for (const signal of signals) {
				const transactions = poolTransactions.get(signal.poolAddress);

				const signalTransaction = findTransaction(transactions, new Date(signal.signaledAt));

				if (!signalTransaction) {
					this._loggerService.log("Не получаеся найти транзакцию сигнала");
					continue;
				}

				const checkedTransactions: ICheckedTransactions = new Map();
				checkedTransactions.set(signalMilestone.id, signalTransaction);

				const checkedMilestones: IChecked<IMilestone>[] = [];
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

				for (const milestone of sortedMilestones) {
					const checkedTransaction = getCheckedTransaction({
						strategy,
						milestone,
						transactions,
						checkedTransactions
					});

					if (!checkedTransaction) {
						continue;
					}

					const delayedTransaction: any = getDelayedTransaction(transactions, checkedTransaction, delay);

					checkedTransactions.set(milestone.id, delayedTransaction);
					checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
				}

				checkedSignals.push({ signal, checkedMilestones });
			}

			checkedStrategies.push({ strategy, checkedSignals });
		}

		return checkedStrategies;
	}

	// Обновленный `getTransactions`
	async getTransactions(signals: ISignal[]): Promise<TransactionEntity[]> {
		const chunkSize = 100; // Размер одного блока сигналов
		const parallelLimit = 10; // Максимальное количество параллельных запросов

		// Разбиваем сигналы на чанки
		const signalsChunks = chunkArray(signals, chunkSize);

		// Формируем задачи для каждого чанка
		const tasks = signalsChunks.map(
			(signalsChunk) => async () =>
				this._transactionsService.getTransactions({
					where: { poolAddress: In(signalsChunk.map((signal) => signal.poolAddress)) },
					order: { date: "asc" }
				})
		);

		// Выполняем запросы параллельно с ограничением
		const allResults = await executeInParallel(tasks, parallelLimit);

		return allResults.flat();
	}
}
