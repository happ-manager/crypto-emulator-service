import { Injectable } from "@nestjs/common";
import { In, IsNull, Not } from "typeorm";

import type { ITransaction } from "../../candles/interfaces/transaction.interface";
import { TransactionsService } from "../../candles/services/transactions.service";
import { findTransaction } from "../../candles/utils/find-transaction.util";
import { LoggerService } from "../../libs/logger";
import { sleep } from "../../shared/utils/sleep.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _transactionsService: TransactionsService,
		private readonly _loggerService: LoggerService
	) {}

	async analyse(signals: ISignal[], sources: string[]) {
		const signalsWhere = signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : { source: In(sources) };

		const findedSignals = await this._signalsService.getSignals({
			where: { ...signalsWhere, token: { dexToolsPairId: Not(IsNull()) } },
			take: 1000,
			relations: ["token"]
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

			const entryTransaction = findTransaction(transactions, signal.signaledAt);
			const [firstTransaction] = transactions;
			const lastTransaction = transactions.at(-1);

			if (!entryTransaction) {
				results.push({
					signal,
					entryTransaction: {},
					firstTransaction: {},
					lastTransaction: {},
					percentTransactions: {},
					minTransaction: {},
					maxTransaction: {}
				});
				continue;
			}

			const maxTransaction = transactions.reduce(
				(max, transaction) => (max.price.gt(transaction.price) ? max : transaction),
				entryTransaction
			);
			const transactionsBeforeMax = transactions.slice(0, transactions.indexOf(maxTransaction) + 1);
			const minTransaction = transactionsBeforeMax.reduce(
				(min, transaction) => (min.price.lt(transaction.price) ? min : transaction),
				maxTransaction
			);

			const minPercent = entryTransaction.price.percentDiff(minTransaction.price);
			const maxPercent = entryTransaction.price.percentDiff(maxTransaction.price);

			const percentTransactions: Record<string, ITransaction | null> = {};

			const transactionsFromMin = [...transactionsBeforeMax].sort((a, b) => (a.price.lte(b.price) ? 1 : -1));
			const transactionsFromMax = [...transactionsBeforeMax].sort((a, b) => (a.price.gte(b.price) ? 1 : -1));

			for (let percent = minPercent.toNumber(); percent <= maxPercent.toNumber(); percent++) {
				const price = entryTransaction.price.percentOf(percent);

				percentTransactions[percent.toString()] =
					percent > 0
						? transactionsFromMax.find((transaction) => transaction.price.gte(price))
						: transactionsFromMin.find((transaction) => transaction.price.lte(price));
			}

			results.push({
				signal,
				entryTransaction,
				maxTransaction,
				minTransaction,
				firstTransaction,
				lastTransaction,
				percentTransactions
			});
		}

		return results;
	}
}
