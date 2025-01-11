import { Injectable } from "@nestjs/common";
import { In } from "typeorm";

import { TransactionsService } from "../../candles/services/transactions.service";
import { findTransaction } from "../../candles/utils/find-transaction.util";
import { LoggerService } from "../../libs/logger";
import { SignalsService } from "../../signals/services/signals.service";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked, ICheckedStrategy, ICheckedTransactions } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import type { IEmulateBody } from "../interfaces/emulator-body.interface";
import { getDelayedTransaction } from "../utils/get-delayed-transaction.util";

@Injectable()
export class EmulatorService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService,
		private readonly _transactionsService: TransactionsService,
		private readonly _checkStrategyService: CheckStrategyService,
		private readonly _loggerService: LoggerService
	) {}

	async emulate(body: IEmulateBody) {
		const { wallets, signals, strategies, delay } = body;

		const { data: findedSignals } = await this._signalsService.getSignals({
			where: {
				// ...(wallets.length > 0 ? { wallet: In(wallets.map((wallet) => wallet.id)) } : {}),
				...(signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : {})
			},
			take: 1000,
			relations: ["token"]
		});
		const findedStrategies = await this._strategiesService.getStrategies({
			where: {
				id: In(strategies.map((strategy) => strategy.id))
			},
			take: 1000,
			relations: this._strategiesService.relations
		});

		const results = [];

		for (const signal of findedSignals) {
			const { data: transactions } = await this._transactionsService.getTransactions({
				where: { poolAddress: signal.poolAddress },
				order: { date: "asc" }
			});
			const checkedStrategies: ICheckedStrategy[] = [];

			for (const strategy of findedStrategies.data) {
				const checkedTransactions: ICheckedTransactions = new Map();
				const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

				if (!signalMilestone) {
					this._loggerService.log("У стратегии должен быть сигнал");
					continue;
				}

				const signalTransaction = findTransaction(transactions, signal.signaledAt);

				if (!signalTransaction) {
					this._loggerService.log("Не получаеся найти транзакцию сигнала");
					continue;
				}

				checkedTransactions.set(signalMilestone.id, signalTransaction);

				const checkedMilestones: IChecked<IMilestone>[] = [];
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

				for (const milestone of sortedMilestones) {
					const checkedTransaction = this._checkStrategyService.getCheckedTransaction({
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
					checkedMilestones.push({ ...milestone, delayedTransaction });
				}

				const { checkedTransaction, delayedTransaction } = checkedMilestones.reduce((a, b) =>
					a.checkedTransaction.date > b.checkedTransaction.date ? a : b
				);

				checkedStrategies.push({ ...strategy, checkedMilestones, checkedTransaction, delayedTransaction });
			}

			results.push({ signal, checkedStrategies });
		}

		return results;
	}
}
