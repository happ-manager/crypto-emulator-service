import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import type { ITransaction } from "../../candles/interfaces/transaction.interface";
import { TransactionsService } from "../../candles/services/transactions.service";
import { findTransaction } from "../../candles/utils/find-transaction.util";
import { LoggerService } from "../../libs/logger";
import { getPercentChange } from "../../shared/utils/get-percent-change.util";
import { getPercentOf } from "../../shared/utils/get-percent-of.util";
import { sleep } from "../../shared/utils/sleep.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";
import { ActionTypeEnum } from "../../strategies/enums/action-type.enum";
import { ConditionFieldEnum } from "../../strategies/enums/condition-field.enum";
import { RelatedToEnum } from "../../strategies/enums/related-to.enum";
import type { ICondition } from "../../strategies/interfaces/condition.interface";
import type { IConditionsGroup } from "../../strategies/interfaces/conditions-group.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { StrategiesService } from "../../strategies/services/strategies.service";
import { checkGroupOperator } from "../utils/check-group-operator.util";
import { checkOperator } from "../utils/check-operator.util";
import { getDelayedTransaction } from "../utils/get-delayed-transaction.util";

@Injectable()
export class EmulatorService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService,
		private readonly _loggerService: LoggerService,
		private readonly _transactionsService: TransactionsService
	) {}

	async emulate(signals: ISignal[], sources: string[], strategies: IStrategy[], investment = 100, delay = 1000) {
		const signalsWhere = signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : { source: In(sources) };

		const findedSignals = await this._signalsService.getSignals({
			where: { ...signalsWhere, token: { dexToolsPairId: Not(IsNull()) } },
			take: 1000,
			relations: ["token"]
		});
		const findedStrategies = await this._strategiesService.getStrategies({
			where: {
				id: In(strategies.map((strategy) => strategy.id))
			},
			take: 1000,
			relations: ["milestones", "milestones.conditionsGroups", "milestones.conditionsGroups.conditions"]
		});

		const results = [];

		for (const [index, signal] of findedSignals.data.entries()) {
			await sleep(100);
			this._loggerService.log(`Fetch signal #${index + 1} of ${findedSignals.data.length}`);

			const { data } = await this._transactionsService.getTransactions({
				where: { poolAddress: signal.poolAddress },
				order: { date: "asc" }
			});

			const transactions = data.filter((transaction) => transaction.price.gt(0));
			const signalTransaction = findTransaction(transactions, signal.signaledAt);
			const strategiesResults = {};

			for (const strategy of findedStrategies.data) {
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);
				const enterMilesone = sortedMilestones.find((milestone) => milestone.actionType === ActionTypeEnum.ENTER);
				const exitMilestones = sortedMilestones.filter((milestone) => milestone.actionType === ActionTypeEnum.EXIT);

				let tokenBalance = 0;
				let enterTransaction: ITransaction = signalTransaction;

				strategiesResults[strategy.name] = { enterPrice: 0, exitPrice: 0, milestones: {} };

				if (enterMilesone) {
					const checkedMilestone = this.checkMilestone(
						transactions,
						enterMilesone,
						signalTransaction,
						enterTransaction
					);

					if (!checkedMilestone) {
						continue;
					}

					const enterTokens = getPercentOf(investment, enterMilesone.value);

					enterTransaction = getDelayedTransaction(transactions, checkedMilestone.transaction, delay);

					if (!enterTransaction) {
						continue;
					}

					tokenBalance += enterTokens;

					strategiesResults[strategy.name].enterPrice = tokenBalance;
					strategiesResults[strategy.name].milestones[enterMilesone.name] = {
						checkedMilestone,
						transaction: enterTransaction,
						enterPrice: tokenBalance
					};
				}

				const transactionsAfterEnter = transactions.filter((transaction) =>
					transaction.date.isSameOrAfter(enterTransaction.date)
				);

				for (const milestone of exitMilestones) {
					const checkedMilestone = this.checkMilestone(
						transactionsAfterEnter,
						milestone,
						signalTransaction,
						enterTransaction
					);

					if (!checkedMilestone) {
						continue;
					}

					const exitTransaction = getDelayedTransaction(transactionsAfterEnter, checkedMilestone.transaction, delay);

					if (!exitTransaction) {
						continue;
					}

					const exitTokens = getPercentOf(tokenBalance, milestone.value);
					const priceDiff = enterTransaction.price.percentDiff(exitTransaction.price).toNumber();

					const exitPrice = getPercentChange(exitTokens, priceDiff);

					tokenBalance -= exitTokens;

					strategiesResults[strategy.name].exitPrice += exitPrice;
					strategiesResults[strategy.name].milestones[milestone.name] = {
						transaction: exitTransaction,
						checkedMilestone,
						exitPrice,
						priceDiff
					};
				}
			}

			results.push({
				signal,
				signalTransaction,
				strategies: strategiesResults
			});
		}

		return results;
	}

	checkMilestone(
		transactions: ITransaction[],
		milestone: IMilestone,
		signalTransaction: ITransaction,
		enterTransaction: ITransaction
	) {
		for (const transaction of transactions) {
			const conditionsGroups = milestone.conditionsGroups.map((group) =>
				this.checkConditionsGroup(group, transaction, signalTransaction, enterTransaction)
			);

			const checkedConditionsGroups = checkGroupOperator(conditionsGroups, milestone.groupOperator);

			if (checkedConditionsGroups.length === 0) {
				continue;
			}

			return { transaction, milestone: { ...milestone, conditionsGroups: checkedConditionsGroups } };
		}
	}

	checkConditionsGroup(
		group: IConditionsGroup,
		transaction: ITransaction,
		signalTransaction: ITransaction,
		enterTransaction: ITransaction
	) {
		const conditions = group.conditions.map((condition) =>
			this.checkCondition(condition, transaction, signalTransaction, enterTransaction)
		);

		const checkedConditions = checkGroupOperator(conditions, group.groupOperator);

		return checkedConditions.length > 0 ? { ...group, conditions: checkedConditions } : null;
	}

	checkCondition(
		condition: ICondition,
		transaction: ITransaction,
		signalTransaction: ITransaction,
		enterTransaction: ITransaction
	) {
		const releatedTransaction = condition.relatedTo === RelatedToEnum.SIGNAL ? signalTransaction : enterTransaction;

		const transactionValue = {
			[ConditionFieldEnum.DATE]: transaction.date.unix() - releatedTransaction.date.unix(),
			[ConditionFieldEnum.PRICE]: releatedTransaction.price.percentDiff(transaction.price).toNumber()
		}[condition.field];

		const isCondition = checkOperator(transactionValue, condition.value, condition.operator);

		return isCondition ? condition : null;
	}
}
