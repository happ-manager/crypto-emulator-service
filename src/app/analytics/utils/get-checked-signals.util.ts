import type {
	IChecked,
	ICheckedTransactions,
	IClownStrategyParmas,
	IMilestone,
	ISignal,
	IStrategy
} from "@happ-manager/crypto-api";
import { MilestoneTypeEnum } from "@happ-manager/crypto-api";
import { getCheckedTransaction } from "@happ-manager/crypto-api";

import { getDelayedTransaction } from "../../emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../../shared/utils/find-transaction.util";
import type { ICheckedSignal } from "../interfaces/checked-signal.interface";

const DELAY = 1000;

export async function getCheckedSignals(
	strategy: IStrategy,
	signals: ISignal[],
	settings: IClownStrategyParmas,
	transactionsMap: any
) {
	const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

	if (!signalMilestone) {
		console.log("У стратегии должен быть сигнал");
		return;
	}

	const checkedSignals: ICheckedSignal[] = [];

	for (const signal of signals) {
		const transactions = transactionsMap.get(signal.poolAddress);

		if (!transactions || transactions.length === 0) {
			console.error(`Cannot find transactions for ${signal.poolAddress}`);
			continue;
		}

		const signalTransaction = findTransaction(transactions, new Date(signal.signaledAt));

		if (!signalTransaction) {
			console.log("Не получаеся найти транзакцию сигнала");
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
				checkedTransactions,
				settings
			});

			if (!checkedTransaction) {
				continue;
			}

			const delayedTransaction = getDelayedTransaction(transactions, checkedTransaction, DELAY);

			checkedTransactions.set(milestone.id, delayedTransaction);
			checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
		}

		checkedSignals.push({ ...signal, checkedMilestones });
	}

	return checkedSignals;
}
