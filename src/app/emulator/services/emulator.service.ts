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

import { TransactionsService } from "../../data/services/transactions.service";
import { findTransaction } from "../../shared/utils/find-transaction.util";
import type { IEmulateBody } from "../interfaces/emulator-body.interface";
import { getDelayedTransaction } from "../utils/get-delayed-transaction.util";

function splitArray(arr: unknown[], chunkSize: number) {
	const result = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		result.push(arr.slice(i, i + chunkSize));
	}
	return result;
}

@Injectable()
export class EmulatorService {
	private readonly _loggerService = new Logger("EmulatorService");

	constructor(private readonly _transactionsService: TransactionsService) {}

	async emulateBySignals(body: IEmulateBody) {
		const { signals, strategies, delay } = body;

		const signalsChunks: ISignal[][] = splitArray(signals, 100);
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

		const signalsChunks: ISignal[][] = splitArray(signals, 100);
		const checkedStrategies: any[] = [];

		for (const strategy of strategies) {
			const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

			if (!signalMilestone) {
				this._loggerService.log("У стратегии должен быть сигнал");
				continue;
			}

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
			}

			checkedStrategies.push({ strategy, checkedSignals });
		}

		return checkedStrategies;
	}
}
