import { Injectable } from "@nestjs/common";

import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import type { ISolanaTransaction } from "../../libs/solana/interfaces/solana-transaction.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import type { IZoneMap } from "../interfaces/zone.interface";

@Injectable()
export class TradingStrategiesService {
	private readonly ZONES: IZoneMap = {
		discount: { min: 0.000_07, trashMin: 0.000_05, max: 0.000_105 },
		premium: { min: 0.000_12, max: 0.000_15 }
	};

	private readonly maxPercent = 45;
	private readonly initalPrices: Record<string, IPrice> = {};

	constructor(
		private readonly _dateService: DateService,
		private readonly _solanaService: SolanaService,
		private readonly _loggerService: LoggerService
	) {}

	checkStrategies(transactions: ISolanaTransaction[], intialTransaction?: ISolanaTransaction) {
		// const trashStrategy = this.trash(transactions);
		// const premiumStrategy = this.premium(transactions);
		// const discountStrategy = this.discount(transactions);
		return this.oneMinuteCandleStrategy(transactions, intialTransaction);
	}

	trash(transactions: ISolanaTransaction[]) {
		const { discount } = this.ZONES;

		const underDiscountTransactions: ISolanaTransaction[][] = [[]];
		const underDiscountDuration = 60;
		let index = 0;
		let lastUnderDiscountTransaction: ISolanaTransaction;

		for (const transaction of transactions) {
			if (transaction.price.lte(discount.min)) {
				underDiscountTransactions[index].push(transaction);
			} else {
				index++;
				underDiscountTransactions[index] = [];
			}
		}

		for (const transaction of underDiscountTransactions) {
			if (transaction.length < 2) {
				continue;
			}

			const [first] = transaction;
			const last = transaction.at(-1);

			const diff = last.date.diff(first.date, "seconds");

			if (diff > underDiscountDuration) {
				lastUnderDiscountTransaction = last;
				break;
			}
		}

		if (!lastUnderDiscountTransaction) {
			return false;
		}

		const transactionsAfterUnderDiscount = transactions.filter((transaction) =>
			transaction.date.isAfter(lastUnderDiscountTransaction.date)
		);

		const upTransactionsAfterAll = transactionsAfterUnderDiscount.filter((transaction) =>
			transaction.price.gte(discount.trashMin)
		);

		return upTransactionsAfterAll.length > 0 ? { minPrice: discount.trashMin, maxPercent: this.maxPercent } : null;
	}

	premium(transactions: ISolanaTransaction[]) {
		const { premium } = this.ZONES;

		const abovePremium: ISolanaTransaction[][] = [[]];
		const abovePremiumDuration = 5;
		let i = 0;
		let lastAbovePremium: ISolanaTransaction;

		for (const transaction of transactions) {
			if (transaction.price.gte(premium.max)) {
				abovePremium[i].push(transaction);
			} else {
				i++;
				abovePremium[i] = [];
			}
		}

		for (const transaction of abovePremium) {
			if (transaction.length < 2) {
				continue;
			}

			const [first] = transaction;
			const last = transaction.at(-1);

			const diff = last.date.diff(first.date, "seconds");

			if (diff > abovePremiumDuration) {
				lastAbovePremium = last;
				break;
			}
		}

		if (!lastAbovePremium) {
			return false;
		}

		const transactionsAfterUnderPremium = transactions.filter((transaction) =>
			transaction.date.isAfter(lastAbovePremium.date)
		);

		const insidePremiumTransactions: ISolanaTransaction[][] = [[]];
		const insdiePremiumDuration = 3;
		let j = 0;
		let lastInsidePremium: ISolanaTransaction;

		for (const transaction of transactionsAfterUnderPremium) {
			if (transaction.price.lte(premium.max) && transaction.price.gte(premium.min)) {
				insidePremiumTransactions[j].push(transaction);
			} else {
				j++;
				insidePremiumTransactions[j] = [];
			}
		}

		for (const transaction of insidePremiumTransactions) {
			if (transaction.length < 2) {
				continue;
			}

			const [first] = transaction;
			const last = transaction.at(-1);

			const diff = last.date.diff(first.date, "seconds");

			if (diff > insdiePremiumDuration) {
				lastInsidePremium = last;
				break;
			}
		}

		if (!lastInsidePremium) {
			return false;
		}

		const transactionsAfterInsidePremium = transactionsAfterUnderPremium.filter((transaction) =>
			transaction.date.isAfter(lastInsidePremium.date)
		);

		const upTransactionsAfterAll = transactionsAfterInsidePremium.filter((transaction) =>
			transaction.price.gte(premium.max)
		);

		return upTransactionsAfterAll.length > 2 ? { minPrice: premium.min, maxPercent: this.maxPercent } : null;
	}

	discount(transactions: ISolanaTransaction[]) {
		const { discount } = this.ZONES;

		const aboveDiscountTransactions: ISolanaTransaction[][] = [[]];
		const abodeDiscountDuration = 5;
		let i = 0;
		let lastAdoveDiscount: ISolanaTransaction;

		for (const transaction of transactions) {
			if (transaction.price.gte(discount.max)) {
				aboveDiscountTransactions[i].push(transaction);
			} else {
				i++;
				aboveDiscountTransactions[i] = [];
			}
		}

		for (const transaction of aboveDiscountTransactions) {
			if (transaction.length < 2) {
				continue;
			}

			const [first] = transaction;
			const last = transaction.at(-1);

			const diff = last.date.diff(first.date, "seconds");

			if (diff > abodeDiscountDuration) {
				lastAdoveDiscount = last;
				break;
			}
		}

		if (!lastAdoveDiscount) {
			return false;
		}

		const transactionsAfterAboveDiscount = transactions.filter((transaction) =>
			transaction.date.isAfter(lastAdoveDiscount.date)
		);

		const insdeDiscountTransactions: ISolanaTransaction[][] = [[]];
		const insideDiscountDuration = 3;
		let j = 0;
		let lastInsideDiscount: ISolanaTransaction;

		for (const transaction of transactionsAfterAboveDiscount) {
			if (transaction.price.lte(discount.max) && transaction.price.gte(discount.min)) {
				insdeDiscountTransactions[j].push(transaction);
			} else {
				j++;
				insdeDiscountTransactions[j] = [];
			}
		}

		for (const transaction of insdeDiscountTransactions) {
			if (transaction.length < 2) {
				continue;
			}

			const [first] = transaction;
			const last = transaction.at(-1);

			const diff = last.date.diff(first.date, "seconds");

			if (diff > insideDiscountDuration) {
				lastInsideDiscount = last;
				break;
			}
		}

		if (!lastInsideDiscount) {
			return false;
		}

		const transactionsAfterInsideDiscount = transactionsAfterAboveDiscount.filter((transaction) =>
			transaction.date.isAfter(lastInsideDiscount.date)
		);

		const upTransactionsAfterAll = transactionsAfterInsideDiscount.filter((transaction) =>
			transaction.price.gte(discount.max)
		);

		return upTransactionsAfterAll.length > 2 ? { minPrice: discount.min, maxPercent: this.maxPercent } : null;
	}

	afterFourSecondsStrategy(transactions: ISolanaTransaction[], signalTransaction: ISolanaTransaction) {
		const ENTER_MIN = 1;
		const SECONDS = 4;

		const { date: signalDate, poolAddress } = signalTransaction;

		const now = this._dateService.now();
		const diff = now.diff(signalDate, "s");

		if (diff < SECONDS || !this.initalPrices[poolAddress]) {
			return false;
		}

		const filteredTransactions = transactions.filter(({ date }) => signalDate.diff(date, "s") < SECONDS);

		for (const filteredTransaction of filteredTransactions) {
			if (!filteredTransaction.price || !this.initalPrices[poolAddress]) {
				continue;
			}

			const priceDiff = this.initalPrices[poolAddress].percentDiff(filteredTransaction.price);

			if (priceDiff.lt(ENTER_MIN)) {
				this._loggerService.log(`Не купили. Цена транзакции: ${filteredTransaction.price}`);
				this._solanaService.unsubscribe([poolAddress]);
				return;
			}
		}

		return true;
	}

	oneMinuteCandleStrategy(transactions: ISolanaTransaction[], initialTransaction?: ISolanaTransaction) {
		if (!initialTransaction) {
			return false;
		}

		// Определяем, относится ли начальная транзакция к первой или второй половине минуты
		const seconds = initialTransaction.date.second();
		const isEarlyMinute = seconds < 30;

		// Устанавливаем конечную точку проверки
		const closingCheckTime = isEarlyMinute
			? initialTransaction.date.startOf("minute").add(58, "seconds") // Если свеча открылась до 30 секунд, проверяем в 00:58
			: initialTransaction.date.add(58, "seconds"); // Если после 30 секунд, проверяем через 58 секунд от начальной даты

		// Фильтруем транзакции, чтобы оставить только те, что произошли до времени закрытия свечи
		const relevantTransactions = transactions.filter((transaction) => transaction.date.isAfter(closingCheckTime));

		if (relevantTransactions.length === 0) {
			return null;
		}

		// Анализируем минимальную цену и процент изменения
		const closingPrice = relevantTransactions.at(-1).price;

		// Возвращаем результат только если цена закрытия выше цены открытия
		if (closingPrice > initialTransaction.price) {
			return { maxPercent: 50, minDuration: 60 };
		}

		return null; // Если свеча не соответствует условию
	}
}
