/* eslint-disable prefer-destructuring */
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import type { Keypair, SendOptions } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import Big from "big.js";
import bs58 from "bs58";
import { Subject } from "rxjs";
import { v4 } from "uuid";

import { TransactionsService } from "../../candles/services/transactions.service";
import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import { INIT_INSTRUCTIONS, SWAP_INSTRUCTIONS } from "../../libs/raydium/enums/raydium-instruction.enum";
import { SolanaPriceService } from "../../libs/solana";
import { PUMFUN_WALLET, RAYDIUM_WALLET, SOL_WALLET } from "../../libs/solana/constant/wallets.constant";
import { CommitmentTypeEnum } from "../../libs/solana/enums/commitment-type.enum";
import type { IComputeUnits } from "../../libs/solana/interfaces/compute-units.interface";
import { ISolanaMessage } from "../../libs/solana/interfaces/solana-message.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import type { IPool } from "../../pools/interfaces/pool.interface";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked, ICheckedTransactions } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import type { IToken } from "../../tokens/interfaces/token.interface";
import { WalletsService } from "../../wallets/services/wallets.service";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import type { ITradingTransaction } from "../interfaces/trading-transaction.interface";
import { TradingTokensService } from "./trading-tokens.service";
import { TradingsService } from "./tradings.service";

@Injectable()
export class TradingService implements OnModuleInit {
	private readonly _createPoolSubjects: Record<string, Subject<ITradingTransaction>> = {};
	private readonly _swapSubjects: Record<string, Subject<ITradingTransaction>> = {};
	private readonly _transactions: Record<string, IBaseTransaction[]> = {};

	private readonly _tokens: Record<string, number> = {};
	private readonly _pools: Record<string, IPool> = {};
	private readonly _signers: Record<string, Keypair> = {};

	constructor(
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _tradingsService: TradingsService,
		private readonly _tradingTokensService: TradingTokensService,
		private readonly _strategiesService: StrategiesService,
		private readonly _checkStrategiesService: CheckStrategyService,
		private readonly _transactionsService: TransactionsService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService,
		private readonly _eventsService: EventsService,
		private readonly _walletsService: WalletsService
	) {}

	get signers() {
		return this._signers;
	}

	onModuleInit() {
		setTimeout(this.init.bind(this), 3000);
	}

	async init() {
		const tradings = await this._tradingsService.getTradings({ where: { disabled: false } });

		for (const trading of tradings.data) {
			await this.start(trading.id);
		}
	}

	async start(id: string) {
		const trading = await this._tradingsService.getTrading({
			where: { id },
			relations: [
				"sourceWallet",
				"targetWallet",
				"strategy",
				"tradingTokens",
				"tradingTokens.pool",
				...this._strategiesService.relations.map((relation) => `strategy.${relation}`)
			]
		});

		if (!trading) {
			return;
		}

		const signalMilestone = trading.strategy.milestones.find(
			(milestone) => milestone.type === MilestoneTypeEnum.SIGNAL
		);

		if (!signalMilestone) {
			this._loggerService.warn("У стратегии должен быть сигнал");
			return;
		}

		this._signers[trading.sourceWallet.address] = await this._walletsService.getKeypair(trading.sourceWallet.secret);

		this.handlePoolCreate(trading);

		for (const tradingToken of trading.tradingTokens) {
			// TODO Надо придумать где хранить checkedTransactions.
			// if (!tradingToken.active) {
			// 	continue;
			// }
			//
			// const poolAddress = tradingToken.pool.address;
			//
			// const { data } = await this._transactionsService.getTransactions({
			// 	where: { poolAddress },
			// 	order: { date: "asc" }
			// });
			// const [initialTransaction] = data;
			//
			// if (!initialTransaction) {
			// 	continue;
			// }
			//
			// this._transactions[poolAddress] = data;
			//
			// this.handleSwap(trading, tradingToken, { [signalMilestone.id]: initialTransaction });
		}

		await this._tradingsService.updateTrading(trading.id, { disabled: false });
	}

	async stop(id: string) {
		const findedTrading = await this._tradingsService.getTrading({
			where: { id },
			relations: ["targetWallet", "tradingTokens", "tradingTokens.pool"]
		});

		if (!findedTrading) {
			return;
		}

		const walletAddress = findedTrading.targetWallet.address;
		const accountExclude = [walletAddress];

		this._createPoolSubjects[walletAddress]?.complete();
		delete this._createPoolSubjects[walletAddress];

		for (const tradingToken of findedTrading.tradingTokens) {
			if (!tradingToken.active) {
				continue;
			}

			const poolAddress = tradingToken.pool.address;

			accountExclude.push(poolAddress);
			this._swapSubjects[poolAddress]?.complete();
			delete this._swapSubjects[poolAddress];
		}

		this._solanaService.subscribeTransactions([], accountExclude);

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: true });
	}

	@OnEvent(EventsEnum.SOLANA_MESSAGE)
	handleSolanaMessage(message: ISolanaMessage) {
		if (!message?.params?.result?.transaction || message.params.result.transaction.meta.err) {
			return;
		}

		const date = this._dateService.now();
		const {
			signature,
			transaction: { meta, transaction }
		} = message.params.result;
		const instructions = [
			...transaction.message.instructions,
			...meta.innerInstructions.flatMap((innerInstruction) => innerInstruction.instructions)
		];

		let instructionType: RaydiumInstruction;
		let pool: IPool;
		let poolAddress: string;
		let authority: string;
		let baseMint: string;
		let quoteMint: string;
		let author: string;
		let isPumpFun: boolean;

		for (const accountKey of transaction.message.accountKeys) {
			if (accountKey.signer) {
				author = accountKey.pubkey;
				if (isPumpFun) {
					break;
				}
			}

			if (accountKey.pubkey === PUMFUN_WALLET) {
				isPumpFun = true;
				if (author) {
					break;
				}
			}
		}

		for (const instruction of instructions) {
			if (instruction.programId !== RAYDIUM_WALLET || !instruction.data) {
				continue;
			}

			const [type] = bs58.decode(instruction.data);

			if (INIT_INSTRUCTIONS.includes(type)) {
				if (!isPumpFun) {
					return;
				}

				instructionType = type;
				poolAddress = instruction.accounts[4];
				authority = instruction.accounts[5];
				baseMint = instruction.accounts[8];
				quoteMint = instruction.accounts[9];
				pool = {
					id: v4(),
					address: poolAddress,
					baseMint,
					quoteMint,
					lpMint: instruction.accounts[7],
					programId: instruction.programId,
					authority,
					openOrders: instruction.accounts[6],
					targetOrders: instruction.accounts[12],
					baseVault: instruction.accounts[10],
					quoteVault: instruction.accounts[11],
					withdrawQueue: SOL_WALLET,
					lpVault: SOL_WALLET,
					marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET.toString(),
					marketId: instruction.accounts[16],
					marketAuthority: Market.getAssociatedAuthority({
						programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
						marketId: new PublicKey(instruction.accounts[16])
					}).publicKey.toString(),
					marketBaseVault: instruction.accounts[20],
					marketQuoteVault: instruction.accounts[11],
					marketBids: instruction.accounts[12],
					marketAsks: instruction.accounts[12],
					marketEventQueue: SOL_WALLET,
					lookupTableAccount: SOL_WALLET,
					baseDecimals: 9,
					quoteDecimals: 6,
					lpDecimals: 9,
					version: 4,
					marketVersion: 3,
					createdAt: date.toDate(),
					updatedAt: date.toDate()
				};

				break;
			}

			if (SWAP_INSTRUCTIONS.includes(type)) {
				poolAddress = instruction.accounts[1];

				if (!this._swapSubjects[poolAddress]) {
					return;
				}

				instructionType = type;
				pool = this._pools[poolAddress];
				authority = pool.authority;
				baseMint = pool.baseMint;
				quoteMint = pool.quoteMint;

				break;
			}
		}

		if (!instructionType) {
			return;
		}

		let preBaseAmount = 0;
		let preQuoteAmount = 0;
		let postBaseAmount = 0;
		let postQuoteAmount = 0;

		for (const preTokenBalance of meta.preTokenBalances) {
			if (preTokenBalance.owner !== authority) {
				continue;
			}

			if (preTokenBalance.mint === baseMint) {
				preBaseAmount = preTokenBalance.uiTokenAmount.uiAmount;

				if (preQuoteAmount) {
					break;
				}
			}

			if (preTokenBalance.mint === quoteMint) {
				preQuoteAmount = preTokenBalance.uiTokenAmount.uiAmount;

				if (preBaseAmount) {
					break;
				}
			}
		}

		for (const postTokenBalance of meta.postTokenBalances) {
			if (postTokenBalance.owner !== authority) {
				continue;
			}

			if (postTokenBalance.mint === baseMint) {
				postBaseAmount = postTokenBalance.uiTokenAmount.uiAmount;

				if (postQuoteAmount) {
					break;
				}
			}

			if (postTokenBalance.mint === quoteMint) {
				postQuoteAmount = postTokenBalance.uiTokenAmount.uiAmount;

				if (postBaseAmount) {
					break;
				}
			}
		}

		const baseChange = postBaseAmount - preBaseAmount;
		const baseChangeToken = postQuoteAmount - preQuoteAmount;

		if (INIT_INSTRUCTIONS.includes(instructionType) && (baseChange < 10 || baseChangeToken < 10_000)) {
			console.log('traitor');
			return;
		}

			const amount = postQuoteAmount - preQuoteAmount;
		const basePrice = this._solanaPriceService.solanaPrice;
		const price = (Math.abs(postBaseAmount) * basePrice) / Math.abs(postQuoteAmount);

		if (!price || !Number.isFinite(price)) {
			// this._filesService.appendToFile("price.json", `${JSON.stringify(message)},\n`);
			console.log(`Something wrong with price: ${signature}`);
			return;
		}

		const tradingTransaction: ITradingTransaction = {
			instructionType,
			pool,
			amount,
			date,
			author,
			price: Big(price),
			signature
		};

		if (INIT_INSTRUCTIONS.includes(instructionType)) {
			this._createPoolSubjects[RAYDIUM_WALLET]?.next(tradingTransaction);
		} else if (SWAP_INSTRUCTIONS.includes(instructionType)) {
			this._swapSubjects[poolAddress].next(tradingTransaction);
		}

		this._eventsService.emit(EventsEnum.TRADING_TRANSACTION, tradingTransaction, true);
	}

	handlePoolCreate(trading: ITrading) {
		const signalMilestone = trading.strategy.milestones.find(
			(milestone) => milestone.type === MilestoneTypeEnum.SIGNAL
		);

		if (!signalMilestone) {
			this._loggerService.warn("У стратегии должен быть сигнал");
			return;
		}

		const walletAddress = trading.targetWallet.address;
		const createPoolSubject = new Subject<ITradingTransaction>();

		this._createPoolSubjects[walletAddress] = createPoolSubject;

		createPoolSubject.subscribe(async (transaction) => {
			const { date, pool } = transaction;
			const poolAddress = pool.address;

			if (this._transactions[poolAddress]) {
				return;
			}

			this._transactions[poolAddress] = [transaction];
			const tradingToken: ITradingToken = {
				id: v4(),
				trading,
				pool,
				amount: 0,
				signaledAt: date,
				active: true,
				token: {
					chain: "solana",
					address: pool.quoteMint
				} as IToken,
				checkedStrategy: {
					...trading.strategy,
					checkedMilestones: [{ ...signalMilestone, checkedTransaction: transaction, delayedTransaction: transaction }]
				},
				createdAt: date.toDate(),
				updatedAt: date.toDate()
			};
			this.handleSwap(trading, tradingToken, { [signalMilestone.id]: transaction });
			this._swapSubjects[poolAddress].next(transaction);
			this._eventsService.emit(EventsEnum.NEW_POOL_DETECTED, { transaction, tradingToken }, true);
			await this._tradingTokensService.createTradingToken(tradingToken);
		});

		this._solanaService.subscribeTransactions([walletAddress], [], CommitmentTypeEnum.PROCESSED);
	}

	handleSwap(trading: ITrading, tradingToken: ITradingToken, checkedTransactions: ICheckedTransactions) {
		const poolAddress = tradingToken.pool.address;

		if (!this._transactions[poolAddress]) {
			return;
		}

		if (!this._pools[poolAddress]) {
			this._pools[poolAddress] = tradingToken.pool;
		}

		const swapSubject = new Subject<ITradingTransaction>();
		const transactions = this._transactions[poolAddress];
		const sortedMilestones = trading.strategy.milestones.sort((a, b) => a.position - b.position);

		let pendingMilestone: IChecked<IMilestone>;
		let pendingSignature: string;

		this._tokens[poolAddress] = tradingToken.amount;
		this._swapSubjects[poolAddress] = swapSubject;

		swapSubject.subscribe(async (transaction) => {
			if (pendingMilestone || pendingSignature) {
				if (pendingSignature !== transaction.signature) {
					return;
				}

				this._tokens[poolAddress] -= transaction.amount;

				this._tradingTokensService.updateTradingToken(tradingToken.id, { amount: this._tokens[poolAddress] }).then();

				pendingMilestone.delayedTransaction = transaction;
				checkedTransactions[pendingMilestone.id] = transaction;

				this._eventsService.emit(
					EventsEnum.MILESTONE_CONFIRMED,
					{ trading, tradingToken, milestone: pendingMilestone },
					true
				);

				pendingMilestone = undefined;
				pendingSignature = undefined;
			}

			const [initTransaction] = transactions;
			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions[milestone.id]);
			const tradingNotStarted = checkedMilestones.length < 2; // Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const duration = this._dateService.now().diff(initTransaction.date, "s");
			const isExpired = duration > trading.tokenTradingDuration;
			const isAllChecked = sortedMilestones.length === checkedMilestones.length;

			if (isAllChecked || (tradingNotStarted && isExpired)) {
				this._solanaService.subscribeTransactions([], [poolAddress]);
				this._tradingTokensService.updateTradingToken(tradingToken.id, { active: false }).then();
				this._swapSubjects[poolAddress]?.complete();
				delete this._swapSubjects[poolAddress];
				return;
			}

			transactions.push(transaction);

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

				const { sourceWallet, price, microLamports, units } = trading;
				const computeUnits: IComputeUnits = { microLamports, units };
				const pool = this._pools[poolAddress];
				const signer = this._signers[sourceWallet.address];

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					pendingSignature = await this.buy(pool, signer, price, computeUnits);
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					const amount = this._tokens[poolAddress];
					pendingSignature = await this.sell(pool, signer, amount, computeUnits);
				}

				this._eventsService.emit(
					EventsEnum.MILESTONE_CHECKED,
					{ tradingToken, milestone: checkedMilestone, signature: pendingSignature },
					true
				);

				break;
			}
		});

		this._solanaService.subscribeTransactions([poolAddress], [], CommitmentTypeEnum.PROCESSED);
	}

	buy(pool: IPool, signer: Keypair, amountInUsd: number, computeUnits: IComputeUnits, sendOptions?: SendOptions) {
		const amount = amountInUsd / this._solanaPriceService.solanaPrice;

		return this._solanaService.swap(
			new PublicKey(pool.baseMint),
			new PublicKey(pool.quoteMint),
			amount,
			signer,
			pool,
			computeUnits,
			sendOptions
		);
	}

	sell(pool: IPool, signer: Keypair, amount: number, computeUnits: IComputeUnits, sendOptions?: SendOptions) {
		return this._solanaService.swap(
			new PublicKey(pool.quoteMint),
			new PublicKey(pool.baseMint),
			amount,
			signer,
			pool,
			computeUnits,
			sendOptions
		);
	}
}
