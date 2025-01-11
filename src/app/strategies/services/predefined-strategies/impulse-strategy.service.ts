import { Injectable } from "@nestjs/common";

import type { IBaseTransaction } from "../../../shared/interfaces/base-transaction.interface";
import { MilestoneTypeEnum } from "../../enums/milestone-type.enum";
import type { ICheckedProps } from "../../interfaces/milestone.interface";
import { getFibLevel } from "../../utils/get-fib-level.util";

@Injectable()
export class ImpulseStrategyService {
	private readonly _points: Map<string, [number, number]> = new Map();

	getCheckedTransaction(props: ICheckedProps) {
		const { strategy, milestone, transactions, checkedTransactions } = props;

		if (milestone.type === MilestoneTypeEnum.BUY) {
			return this.checkBuy(transactions);
		}

		if (milestone.type === MilestoneTypeEnum.SELL) {
			const buyMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.BUY);

			if (!buyMilestone) {
				return;
			}

			const buyTransaction = checkedTransactions.get(buyMilestone.id);

			if (!buyTransaction) {
				return;
			}

			const transactionsAfterBuy = transactions.filter((transaction) => transaction.date > buyTransaction.date);

			return this.checkSell(transactionsAfterBuy, buyTransaction);
		}
	}

	checkBuy(transactions: IBaseTransaction[]) {
		const [initTransaction, ...restTransactions] = transactions;

		let maxPrice = initTransaction.price;
		let minPrice = initTransaction.price;

		for (const transaction of restTransactions) {
			if (transaction.price > maxPrice) {
				maxPrice = transaction.price;
				continue;
			}

			if (transaction.price < minPrice) {
				minPrice = transaction.price;
				continue;
			}

			const fibLevel = getFibLevel(minPrice, maxPrice, 0.618);

			if (transaction.price > fibLevel) {
				continue;
			}

			this._points.set(transaction["poolAddress"], [minPrice, maxPrice]);

			return transaction;
		}
	}

	checkSell(transactions: IBaseTransaction[], buyTransaction: IBaseTransaction) {
		if (!this._points.has(buyTransaction["poolAddress"])) {
			return;
		}

		const [minPrice, maxPrice] = this._points.get(buyTransaction["poolAddress"]);

		const stopFib = getFibLevel(minPrice, maxPrice, 0.1);
		const lossFib = getFibLevel(minPrice, maxPrice, 0.236);

		for (const transaction of transactions) {
			if (transaction.price < stopFib || transaction.price > lossFib) {
				continue;
			}

			return transaction;
		}
	}
}
