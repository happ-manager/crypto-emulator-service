import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import Big from "big.js";
import * as Dayjs from "dayjs";

import type { IBaseTransaction } from "../../../shared/interfaces/base-transaction.interface";
import type { IMilestoneProps } from "../../interfaces/milestone.interface";
import { getFibLevel } from "../../utils/get-fib-level.util";

const ENTRY_RATIO = 0.618;

@Injectable()
export class ImpulseStrategyService implements OnModuleInit {
	onModuleInit(): any {
		setTimeout(async () => {
			const prices = [1, 2, 1.3];
			const prices2 = [1, 0.5, 1.5, 2, 0.7];

			const transactions: IBaseTransaction[] = [];
			const startDate = Date.now();

			for (const [index, price] of prices2.entries()) {
				transactions.push({ date: Dayjs(startDate + index), price: Big(price), author: "" });

				// const checkedMilestone = this.getCheckedMilestone(transactions);

				// if (checkedMilestone) {
				// 	console.log(`${index} ${checkedMilestone}`);
				// }
			}
		}, 100);
	}

	getCheckedMilestone(props: IMilestoneProps) {
		const { strategy, milestone, transactions, checkedTransactions } = props;

		const [initTransaction, ...restTransactions] = transactions;

		let maxPrice = initTransaction.price;
		let minPrice = initTransaction.price;

		for (const transaction of restTransactions) {
			if (transaction.price.gt(maxPrice)) {
				maxPrice = transaction.price;
				continue;
			}

			if (transaction.price.lt(minPrice)) {
				minPrice = transaction.price;
				continue;
			}

			if (transaction.price.lt(maxPrice) && maxPrice.gt(initTransaction.price)) {
				const entryLevel = getFibLevel(minPrice.toNumber(), maxPrice.toNumber(), ENTRY_RATIO);

				if (transaction.price.lt(entryLevel)) {
					return { ...milestone, checkedConditionsGroups: [], checkedTransaction: initTransaction };
				}
			}
		}

		return { ...milestone, checkedConditionsGroups: [], checkedTransaction: initTransaction };
	}
}
