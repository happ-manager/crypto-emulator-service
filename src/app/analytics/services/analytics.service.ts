import {
	getCheckedTransaction,
	IChecked,
	ICheckedTransactions,
	IClownStrategyParmas,
	IMilestone,
	ISignal,
	IStrategy,
	MilestoneTypeEnum,
	percentOf,
	PredefinedStrategyEnum
} from "@happ-manager/crypto-api";
import { Injectable, Logger } from "@nestjs/common";
import { In } from "typeorm";

import { TransactionEntity } from "../../data/entities/transaction.entity";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { TransactionsService } from "../../data/services/transactions.service";
import { getDelayedTransaction } from "../../emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../../shared/utils/find-transaction.util";
import { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";
import { generateSettings } from "../utils/generate-settings.util";

const DELAY = 1000;
const INVESTMENT = 100;

interface ICheckedSignal extends ISignal {
	checkedMilestones: IChecked<IMilestone>[];
}

@Injectable()
export class AnalyticsService {
	private readonly _loggerService = new Logger("AnalyticsService");

	constructor(
		private readonly _transactionsService: TransactionsService,
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService
	) {}

	async analyse(body?: IGenerateSettingsProps) {
		const { signalsSkip = 0, signalsTake = 5 } = body;
		const strategy = await this._strategiesService.getStrategy({
			where: {
				predefinedStrategy: PredefinedStrategyEnum.CLOWN
			},
			relations: ["milestones"]
		});
		const signals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		const settings = generateSettings(body);
		const checkedSignals: ICheckedSignal[] = [];

		let bestResult = { totalProfit: 0 };
		let bestSetting: any;

		console.log(settings.length);

		for (const [index, setting] of settings.entries()) {
			const startDate = Date.now();
			console.log(`Setting ${index + 1} started`);

			const checkedSignalsChunk = await this.getCheckedSignals(strategy, signals, setting);

			checkedSignals.push(...checkedSignalsChunk);
			const strategyResult = await this.getStrategyResults(checkedSignals);

			if (strategyResult.totalProfit > bestResult.totalProfit) {
				bestResult = strategyResult;
				bestSetting = setting;
			}

			console.log(`Setting ${index + 1} finished in ${(Date.now() - startDate) / 1000}`);
		}

		return {
			bestResult,
			bestSetting
		};
	}

	async getCheckedSignals(strategy: IStrategy, signals: ISignal[], settings: IClownStrategyParmas) {
		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

		if (!signalMilestone) {
			this._loggerService.log("У стратегии должен быть сигнал");
			return;
		}

		const poolAddresses = signals.map((signal) => signal.poolAddress);
		const allTransactions = await this._transactionsService.getTransactions({
			where: { poolAddress: In(poolAddresses) }
		});
		const transactionsMap = new Map<string, TransactionEntity[]>();
		const checkedSignals: ICheckedSignal[] = [];

		for (const transaction of allTransactions) {
			if (!transactionsMap.has(transaction.poolAddress)) {
				transactionsMap.set(transaction.poolAddress, [transaction]);
				continue;
			}

			transactionsMap.get(transaction.poolAddress).push(transaction);
		}

		for (const signal of signals) {
			const transactions = transactionsMap.get(signal.poolAddress);

			if (!transactions || transactions.length === 0) {
				console.error(`Cannot find transactions for ${signal.poolAddress}`);
				continue;
			}

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

	async getStrategyResults(checkedSignals: ICheckedSignal[]) {
		const strategyResult = {
			winCount: 0,
			loseCount: 0,
			ignoreCount: 0,
			winSeries: 0,
			loseSeries: 0,
			totalEnter: 0,
			totalProfit: 0,
			totalExit: 0
		};

		let winStreak = 0;
		let loseStreak = 0;

		for (const checkedSignal of checkedSignals) {
			let investment = INVESTMENT;
			let tokenBalance = 0;
			let totalEnter = 0;
			let totalExit = 0;

			for (const checkedMilestone of checkedSignal.checkedMilestones) {
				const milestoneValue = Number.parseFloat(checkedMilestone.value || "0");
				const tokenPrice = checkedMilestone.delayedTransaction.price;

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					const enterPrice = percentOf(investment, milestoneValue);
					const tokens = enterPrice / tokenPrice;

					totalEnter += tokens * tokenPrice;
					investment -= enterPrice;
					tokenBalance += tokens;
					checkedMilestone["enterPrice"] = enterPrice;
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					const tokens = percentOf(tokenBalance, milestoneValue);
					const exitPrice = tokens * tokenPrice;

					totalExit += exitPrice;
					investment += exitPrice;
					tokenBalance -= tokens;
					checkedMilestone["exitPrice"] = exitPrice;
				}
			}

			checkedSignal["enterPrice"] = totalEnter;
			checkedSignal["exitPrice"] = totalExit;
			const profit = totalExit - totalEnter;

			strategyResult.totalEnter += totalEnter;
			strategyResult.totalExit += totalExit;
			strategyResult.totalProfit += profit;

			if (totalEnter === 0) {
				strategyResult.ignoreCount++;
			} else if (profit >= 0) {
				strategyResult.winCount++;
				strategyResult.loseSeries = 0;

				if (++winStreak > strategyResult.winSeries) {
					strategyResult.winSeries = winStreak;
				}
			} else if (profit < 0) {
				strategyResult.loseCount++;
				strategyResult.winSeries = 0;

				if (++loseStreak > strategyResult.loseSeries) {
					strategyResult.loseSeries = loseStreak;
				}
			}
		}

		return strategyResult;
	}
}
