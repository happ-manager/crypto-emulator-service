import { Injectable } from "@nestjs/common";
import { In } from "typeorm";

import type { ITransaction } from "../../candles/interfaces/transaction.interface";
import { TransactionsService } from "../../candles/services/transactions.service";
import { findTransaction } from "../../candles/utils/find-transaction.util";
import { SignalsService } from "../../signals/services/signals.service";
import type { IAnalyticsBody } from "../interfaces/analytics-body.interface";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _signalsService: SignalsService,
		private readonly _transactionsService: TransactionsService
	) {}

	async analyse(body: IAnalyticsBody) {
		const { signals, wallets } = body;
		const { data: findedSignals } = await this._signalsService.getSignals({
			where: {
				// ...(wallets.length > 0 ? { wallet: In(wallets.map((wallet) => wallet.id)) } : {}),
				...(signals.length > 0 ? { id: In(signals.map((signal) => signal.id)) } : {})
			},
			take: 1000,
			relations: ["token"]
		});

		const results = [];

		for (const signal of findedSignals) {
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

			const minPercent = minTransaction.price.percentDiff(entryTransaction.price);
			const maxPercent = maxTransaction.price.percentDiff(entryTransaction.price);

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
