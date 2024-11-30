import { Injectable } from "@nestjs/common";
import { In } from "typeorm";

import { TransactionsService } from "../../candles/services/transactions.service";
import { findTransaction } from "../../candles/utils/find-transaction.util";
import { LoggerService } from "../../libs/logger";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { IRefs } from "../../strategies/interfaces/refs.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import { TokensService } from "../../tokens/services/tokens.service";
import type { IEmulateBody } from "../interfaces/emulator-body.interface";
import { getDelayedTransaction } from "../utils/get-delayed-transaction.util";

@Injectable()
export class EmulatorService {
	constructor(
		private readonly _tokensService: TokensService,
		private readonly _strategiesService: StrategiesService,
		private readonly _transactionsService: TransactionsService,
		private readonly _checkStrategyService: CheckStrategyService,
		private readonly _loggerService: LoggerService
	) {}

	async emulate(body: IEmulateBody) {
		const { wallets, tokens, strategies, delay } = body;

		const { data: findedTokens } = await this._tokensService.getTokens({
			where: {
				// ...(wallets.length > 0 ? { wallet: In(wallets.map((wallet) => wallet.id)) } : {}),
				...(tokens.length > 0 ? { id: In(tokens.map((token) => token.id)) } : {})
			},
			take: 1000,
			relations: ["signal"]
		});
		const findedStrategies = await this._strategiesService.getStrategies({
			where: {
				id: In(strategies.map((strategy) => strategy.id))
			},
			take: 1000,
			relations: this._strategiesService.relations
		});

		const results = [];

		for (const token of findedTokens) {
			const { data: transactions } = await this._transactionsService.getTransactions({
				where: { poolAddress: token.poolAddress },
				order: { date: "asc" }
			});
			const checkedStrategies: IChecked<IStrategy>[] = [];

			for (const strategy of findedStrategies.data) {
				const refs: IRefs = {};
				const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

				if (!signalMilestone) {
					this._loggerService.log("У стратегии должен быть сигнал");
					continue;
				}

				const signalTransaction = findTransaction(transactions, token.signal.signaledAt);

				if (!signalTransaction) {
					this._loggerService.log("Не получаеся найти транзакцию сигнала");
					continue;
				}

				refs[signalMilestone.id] = signalTransaction;

				const checkedMilestones: IChecked<IMilestone>[] = [
					{ ...signalMilestone, checkedTransaction: signalTransaction, delayedTransaction: signalTransaction }
				];

				const notSignalMilestones = strategy.milestones.filter(({ type }) => type !== MilestoneTypeEnum.SIGNAL);

				for (const milestone of notSignalMilestones) {
					const checkedMilestone = this._checkStrategyService.getCheckedMilestone(milestone, transactions, refs);

					if (!checkedMilestone) {
						continue;
					}

					const delayedTransaction = getDelayedTransaction(transactions, checkedMilestone.checkedTransaction, delay);

					refs[checkedMilestone.id] = delayedTransaction;

					checkedMilestones.push({ ...checkedMilestone, delayedTransaction });
				}

				const { checkedTransaction, delayedTransaction } = checkedMilestones.reduce((a, b) =>
					a.checkedTransaction.date.isAfter(b.checkedTransaction.date) ? a : b
				);

				checkedStrategies.push({ ...strategy, checkedMilestones, checkedTransaction, delayedTransaction });
			}

			results.push({ token, checkedStrategies });
		}

		return results;
	}
}
