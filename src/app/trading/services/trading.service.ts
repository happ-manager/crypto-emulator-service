import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { v4 } from "uuid";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { CryptoService } from "../../libs/crypto";
import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import { SubscribtionTypeEnum } from "../../libs/solana/enums/subscribtion-type.enum";
import type { ISolanaTransaction } from "../../libs/solana/interfaces/solana-transaction.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked, ICheckedTransactions } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingTokensService } from "./trading-tokens.service";
import { TradingsService } from "./tradings.service";

@Injectable()
export class TradingService implements OnModuleInit {
	private readonly _tradingRelations = [
		"sourceWallet",
		"targetWallet",
		"strategy",
		...this._strategiesService.relations.map((relation) => `strategy.${relation}`)
	];

	private readonly _transactions: Record<string, ISolanaTransaction[]> = {};

	constructor(
		private readonly _cryptoService: CryptoService,
		private readonly _solanaService: SolanaService,
		private readonly _tradingsService: TradingsService,
		private readonly _tradingTokensService: TradingTokensService,
		private readonly _strategiesService: StrategiesService,
		private readonly _checkStrategiesService: CheckStrategyService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService,
		private readonly _eventsService: EventsService
	) {}

	onModuleInit() {
		setTimeout(this.init.bind(this), 0);
	}

	async init() {
		const tradings = await this._tradingsService.getTradings({
			where: { disabled: false },
			relations: [...this._tradingRelations, "tradingTokens"]
		});

		for (const trading of tradings.data) {
			this.subscribeOnBuyChanges(trading);

			for (const tradingToken of trading.tradingTokens) {
				// this._transactions[tradingToken.poolAddress] = [];
				// this.subscribeOnPriceChanges(trading, tradingToken);
			}
		}
	}

	async start(id: string) {
		const findedTrading = await this._tradingsService.getTrading({ where: { id }, relations: this._tradingRelations });

		if (!findedTrading) {
			return;
		}

		this.subscribeOnBuyChanges(findedTrading);

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: false });
	}

	async stop(id: string) {
		const findedTrading = await this._tradingsService.getTrading({
			where: { id },
			relations: ["targetWallet", "tradingTokens"]
		});

		if (!findedTrading) {
			return;
		}

		const poolAddresses = findedTrading.tradingTokens.map((tradingToken) => tradingToken.poolAddress);

		this.unsubscribe(findedTrading.targetWallet.address, ...poolAddresses);

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: true });
	}

	subscribeOnBuyChanges(trading: ITrading) {
		const signalMilestone = trading.strategy.milestones.find(
			(milestone) => milestone.type === MilestoneTypeEnum.SIGNAL
		);

		if (!signalMilestone) {
			this._loggerService.warn("У стратегии должен быть сигнал");
			return;
		}

		this._solanaService.on(trading.targetWallet.address, SubscribtionTypeEnum.BUY).subscribe(async (transaction) => {
			if (this._transactions[transaction.poolAddress] || !transaction) {
				return;
			}

			this._transactions[transaction.poolAddress] = [transaction];

			const tradingToken = {
				id: v4(),
				signaledAt: transaction.date,
				walletAddress: transaction.walletAddress,
				poolAddress: transaction.poolAddress,
				price: trading.price,
				trading
			} as ITradingToken;

			const checkedTransactions: ICheckedTransactions = { [signalMilestone.id]: transaction };

			this.subscribeOnPriceChanges(trading, tradingToken, checkedTransactions);

			await this._tradingTokensService.createTradingToken({
				...tradingToken,
				checkedStrategy: {
					...trading.strategy,
					checkedMilestones: [{ ...signalMilestone, checkedTransaction: transaction, delayedTransaction: transaction }]
				}
			});
		});
	}

	subscribeOnPriceChanges(trading: ITrading, tradingToken: ITradingToken, checkedTransactions: ICheckedTransactions) {
		if (!this._transactions[tradingToken.poolAddress]) {
			return;
		}

		const transactions = this._transactions[tradingToken.poolAddress];
		const sortedMilestones = trading.strategy.milestones.sort((a, b) => a.position - b.position);

		let pendingMilestone: IChecked<IMilestone>;

		this._solanaService.on(tradingToken.poolAddress, SubscribtionTypeEnum.PRICE).subscribe(async (transaction) => {
			const [firstTransaction] = transactions;

			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions[milestone.id]);
			const duration = this._dateService.now().diff(firstTransaction.date, "s");

			// Первое выполненое условие - "Сигнал". Если их > 2 - значит была "Покупка"
			if (duration > trading.tokenTradingDuration && checkedMilestones.length < 2) {
				// this.unsubscribe(transaction.poolAddress);
				// return;
			}

			transactions.push(transaction);

			if (pendingMilestone) {
				const isMe = (transaction.authories || []).includes(trading.sourceWallet.address);

				if (!isMe) {
					return;
				}

				pendingMilestone.delayedTransaction = transaction;

				this._eventsService.emit(
					EventsEnum.MILESTONE_CONFIRMED,
					{ trading, tradingToken, milestone: pendingMilestone },
					true
				);

				checkedTransactions[pendingMilestone.id] = transaction;
				pendingMilestone = undefined;

				if (sortedMilestones.length === checkedMilestones.length) {
					this.unsubscribe(transaction.poolAddress);
					return;
				}
			}

			for (const milestone of sortedMilestones) {
				if (checkedTransactions[milestone.id]) {
					continue;
				}

				const checkedMilestone = this._checkStrategiesService.getCheckedMilestone(
					milestone,
					transactions,
					checkedTransactions
				);

				if (!checkedMilestone) {
					continue;
				}

				pendingMilestone = checkedMilestone;

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					this.buy(transaction.poolAddress, trading.price, trading.sourceWallet.secret).then();
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					this.sell(transaction.poolAddress, trading.sourceWallet.secret).then();
				}

				this._eventsService.emit(EventsEnum.MILESTONE_CHECKED, { tradingToken, milestone: checkedMilestone }, true);

				break;
			}
		});
	}

	buy(poolAddress: string, price: IPrice, cryptedSecret: string) {
		const secret = this._cryptoService.decrypt(cryptedSecret);

		return this._solanaService.buy(poolAddress, price.toNumber(), secret);
	}

	sell(poolAddress: string, cryptedSecret: string) {
		const secret = this._cryptoService.decrypt(cryptedSecret);

		return this._solanaService.sell(poolAddress, secret);
	}

	unsubscribe(...accounts: string[]) {
		this._solanaService.unsubscribe(accounts);

		for (const account of accounts) {
			delete this._transactions[account];
		}
	}
}
