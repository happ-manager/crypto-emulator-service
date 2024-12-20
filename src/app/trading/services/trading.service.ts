import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Subject } from "rxjs";
import { v4 } from "uuid";

import { TransactionTypeEnum } from "../../candles/enums/transaction-type.enum";
import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { CryptoService } from "../../libs/crypto";
import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { IPrice } from "../../libs/price/interfaces/price.interface";
import { CommitmentTypeEnum } from "../../libs/solana/enums/commitment-type.enum";
import { ISolanaInTransaction } from "../../libs/solana/interfaces/solana-transaction.interface";
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

const MINUTES_15 = 900;

@Injectable()
export class TradingService implements OnModuleInit {
	private readonly _tradingRelations = [
		"sourceWallet",
		"targetWallet",
		"strategy",
		...this._strategiesService.relations.map((relation) => `strategy.${relation}`)
	];

	private readonly _transactions: Record<string, ISolanaInTransaction[]> = {};
	private readonly _initSubscribtions: Record<string, Subject<ISolanaInTransaction>> = {};
	private readonly _transferSubscribtions: Record<string, Subject<ISolanaInTransaction>> = {};

	private readonly _tokens: Record<string, number> = {};
	private readonly _poolKeys: Record<string, LiquidityPoolKeysV4> = {};

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
		setTimeout(this.init.bind(this), 3000);
	}

	async init() {
		const tradings = await this._tradingsService.getTradings({
			where: { disabled: false },
			relations: [...this._tradingRelations, "tradingTokens"]
		});

		for (const trading of tradings.data) {
			this.handleBuys(trading);

			// TODO: Что бы перезапускать отслеживания монет после падения приложения нужно придумать как доставать транзакцию сигнала для первого значения массива
			for (const tradingToken of trading.tradingTokens) {
				// this._transactions[tradingToken.poolAddress] = [];
				// this.subscribeOnPriceChanges(trading, tradingToken);
			}
		}
	}

	@OnEvent(EventsEnum.SOLANA_TRANSACTION)
	handleSolanaTransaction(transaction: ISolanaInTransaction) {
		if (transaction.type === TransactionTypeEnum.INIT) {
			this._initSubscribtions[transaction.walletAddress]?.next(transaction);
		} else if (transaction.type === TransactionTypeEnum.TRANSFER) {
			this._transferSubscribtions[transaction.poolAddress]?.next(transaction);
		}

		if (!this._transactions[transaction.poolAddress]) {
			return;
		}

		const [initTransaction] = this._transactions[transaction.poolAddress];
		const duration = transaction.date.diff(initTransaction.date, "s");

		if (duration < MINUTES_15) {
			return;
		}

		this._solanaService.subscribeTransactions([], [transaction.poolAddress]);
	}

	on(account: string, transactionType: TransactionTypeEnum) {
		const subject = new Subject<ISolanaInTransaction>();

		let commitmentType: CommitmentTypeEnum;

		if (transactionType === TransactionTypeEnum.INIT) {
			this._initSubscribtions[account] = subject;
			commitmentType = CommitmentTypeEnum.PROCESSED; // Для покупок. Можно в процессе
		} else if (transactionType === TransactionTypeEnum.TRANSFER) {
			this._transferSubscribtions[account] = subject;
			commitmentType = CommitmentTypeEnum.CONFIRMED; // Для цен. Только подтверженных
		}

		this._solanaService.subscribeTransactions([account], [], commitmentType);

		return subject;
	}

	async start(id: string) {
		const findedTrading = await this._tradingsService.getTrading({ where: { id }, relations: this._tradingRelations });

		if (!findedTrading) {
			return;
		}

		this.handleBuys(findedTrading);

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

		this.unsubscribe([findedTrading.targetWallet.address, ...poolAddresses]);

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: true });
	}

	handleBuys(trading: ITrading) {
		const signalMilestone = trading.strategy.milestones.find(
			(milestone) => milestone.type === MilestoneTypeEnum.SIGNAL
		);

		if (!signalMilestone) {
			this._loggerService.warn("У стратегии должен быть сигнал");
			return;
		}

		this.on(trading.targetWallet.address, TransactionTypeEnum.INIT).subscribe(async (transaction) => {
			if (this._transactions[transaction.poolAddress]) {
				return;
			}

			this._poolKeys[transaction.poolAddress] = transaction.poolKeys;
			this._transactions[transaction.poolAddress] = [transaction];

			const tradingToken: ITradingToken = {
				id: v4(),
				signaledAt: transaction.date,
				walletAddress: transaction.walletAddress,
				poolAddress: transaction.poolAddress,
				price: trading.price,
				tokenMint: transaction.tokenMint,
				createdAt: new Date(),
				updatedAt: new Date(),
				trading
			};

			const checkedTransactions: ICheckedTransactions = { [signalMilestone.id]: transaction };

			this.handlePrices(trading, tradingToken, checkedTransactions);

			this._transferSubscribtions[tradingToken.poolAddress]?.next(transaction);

			await this._tradingTokensService.createTradingToken({
				...tradingToken,
				checkedStrategy: {
					...trading.strategy,
					checkedMilestones: [{ ...signalMilestone, checkedTransaction: transaction, delayedTransaction: transaction }]
				}
			});
		});
	}

	handlePrices(trading: ITrading, tradingToken: ITradingToken, checkedTransactions: ICheckedTransactions) {
		if (!this._transactions[tradingToken.poolAddress]) {
			return;
		}

		const transactions = this._transactions[tradingToken.poolAddress];
		const sortedMilestones = trading.strategy.milestones.sort((a, b) => a.position - b.position);

		let pendingMilestone: IChecked<IMilestone>;

		this.on(tradingToken.poolAddress, TransactionTypeEnum.TRANSFER).subscribe(async (transaction) => {
			const [firstTransaction] = transactions;

			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions[milestone.id]);
			const duration = this._dateService.now().diff(firstTransaction.date, "s");

			// Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const isTradingStartedAndNotOver =
				checkedMilestones.length > 1 && checkedMilestones.length < sortedMilestones.length;
			const isExpired = duration > trading.tokenTradingDuration;

			if (isExpired && !isTradingStartedAndNotOver) {
				this.unsubscribe([transaction.poolAddress]);
				return;
			}

			transactions.push(transaction);

			if (pendingMilestone) {
				const isMe = (transaction.authories || []).includes(trading.sourceWallet.address);

				if (!isMe) {
					return;
				}

				pendingMilestone.delayedTransaction = transaction;
				checkedTransactions[pendingMilestone.id] = transaction;
				this._tokens[transaction.poolAddress] = transaction.tokenAmount;

				this._eventsService.emit(
					EventsEnum.MILESTONE_CONFIRMED,
					{ trading, tradingToken, milestone: pendingMilestone },
					true
				);

				pendingMilestone = undefined;

				if (sortedMilestones.length === checkedMilestones.length) {
					this.unsubscribe([transaction.poolAddress]);
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
				let signature = "";

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					console.log("START BUY");

					signature = await this.buy(
						tradingToken.poolAddress,
						trading.price,
						trading.sourceWallet.secret,
						trading.microLamports,
						trading.units
					);
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					console.log("START SELL");

					signature = await this.sell(
						tradingToken.poolAddress,
						trading.sourceWallet.secret,
						trading.microLamports,
						trading.units
					);
				}

				console.log({ signature });

				this._eventsService.emit(
					EventsEnum.MILESTONE_CHECKED,
					{ tradingToken, milestone: checkedMilestone, signature },
					true
				);

				break;
			}
		});
	}

	buy(poolAddress: string, price: IPrice, cryptedSecret: string, microLamports: number, units: number) {
		const secret = this._cryptoService.decrypt(cryptedSecret);
		const poolKeys = this._poolKeys[poolAddress];
		const owner = Keypair.fromSecretKey(bs58.decode(secret));

		if (!poolKeys) {
			return;
		}

		return this._solanaService.swap({
			owner,
			poolKeys,
			from: poolKeys.baseMint,
			to: poolKeys.quoteMint,
			amount: price.toNumber(),
			microLamports,
			units,
			skipPreflight: true,
			preflightCommitment: "processed",
			maxRetries: 1,
			rpc: this._solanaService.rpc,
			blockhash: this._solanaService.blockhash
		});
	}

	sell(poolAddress: string, cryptedSecret: string, microLamports: number, units: number) {
		const secret = this._cryptoService.decrypt(cryptedSecret);
		const poolKeys = this._poolKeys[poolAddress];
		const amount = this._tokens[poolAddress];
		const owner = Keypair.fromSecretKey(bs58.decode(secret));

		if (!poolKeys || !amount) {
			return;
		}

		return this._solanaService.swap({
			owner,
			poolKeys,
			from: poolKeys.quoteMint,
			to: poolKeys.baseMint,
			amount,
			microLamports,
			units,
			skipPreflight: true,
			preflightCommitment: "processed",
			maxRetries: 1,
			rpc: this._solanaService.rpc,
			blockhash: this._solanaService.blockhash
		});
	}

	unsubscribe(accounts: string[]) {
		for (const account of accounts) {
			this._initSubscribtions[account]?.complete();
			this._transferSubscribtions[account]?.complete();

			delete this._initSubscribtions[account];
			delete this._transferSubscribtions[account];
		}
	}
}
