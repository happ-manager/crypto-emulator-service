/* eslint-disable prefer-destructuring */
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Cron } from "@nestjs/schedule";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import type { Keypair, SendOptions } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { Subject } from "rxjs";
import { In } from "typeorm";
import { v4 } from "uuid";

import { SolanaPriceService } from "../../libs/solana";
import { PUMFUN_WALLET, RAYDIUM_WALLET, SOL_WALLET } from "../../libs/solana/constant/wallets.constant";
import { CommitmentTypeEnum } from "../../libs/solana/enums/commitment-type.enum";
import type { RaydiumInstruction } from "../../libs/solana/enums/raydium-instruction.enum";
import { INIT_INSTRUCTIONS, SWAP_INSTRUCTIONS } from "../../libs/solana/enums/raydium-instruction.enum";
import type { IComputeUnits } from "../../libs/solana/interfaces/compute-units.interface";
import { ISolanaMessage } from "../../libs/solana/interfaces/solana-message.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import type { IPool } from "../../pools/interfaces/pool.interface";
import { EventsEnum } from "../../shared/enums/events.enum";
import type { IBaseTransaction } from "../../shared/interfaces/base-transaction.interface";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked, ICheckedTransactions } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import { WalletsService } from "../../wallets/services/wallets.service";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import type { ITradingTransaction } from "../interfaces/trading-transaction.interface";
import { TradingTokensService } from "./trading-tokens.service";
import { TradingsService } from "./tradings.service";

@Injectable()
export class TradingService {
	private readonly _loggerService = new Logger("TradingService");

	private readonly _createPoolSubjects: Map<string, Subject<ITradingTransaction>> = new Map();
	private readonly _swapSubjects: Map<string, Subject<ITradingTransaction>> = new Map();
	private readonly _transactions: Map<string, IBaseTransaction[]> = new Map();

	private readonly _tokens: Map<string, number> = new Map();
	private readonly _pools: Map<string, IPool> = new Map();
	private readonly _signers: Map<string, Keypair> = new Map();

	private readonly _signatures: Set<string> = new Set();

	private readonly _transactionsService: any;

	constructor(
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _tradingsService: TradingsService,
		private readonly _tradingTokensService: TradingTokensService,
		private readonly _strategiesService: StrategiesService,
		private readonly _checkStrategiesService: CheckStrategyService,
		private readonly _eventsService: EventEmitter2,
		private readonly _walletsService: WalletsService
	) {}

	@Cron("*/30 * * * *")
	async clearSignature() {
		this._signatures.clear();
	}

	get signers() {
		return this._signers;
	}

	async init() {
		this._loggerService.log("Trading is running");

		const tradings = await this._tradingsService.getTradings({ where: { disabled: false } });

		for (const trading of tradings.data) {
			await this.start(trading.id);
		}
	}

	async start(id: string) {
		const [trading, tradingTokens] = await Promise.all([
			this._tradingsService.getTrading({
				where: { id },
				relations: [
					"sourceWallet",
					"targetWallet",
					"strategy",
					...this._strategiesService.relations.map((relation) => `strategy.${relation}`)
				]
			}),
			this._tradingTokensService.repository.find({
				where: {
					trading: { id },
					disabled: false
				},
				relations: ["pool"]
			})
		]);

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

		const keypair = await this._walletsService.getKeypair(trading.sourceWallet.secret);

		this._signers.set(trading.sourceWallet.address, keypair);

		this.handlePoolCreate(trading);

		for (const tradingToken of tradingTokens) {
			const poolAddress = tradingToken.pool.address;

			const { data } = await this._transactionsService.getTransactions({
				where: { poolAddress },
				order: { date: "asc" }
			});

			if (data.length === 0 || tradingToken.checkedStrategy?.checkedMilestones?.length === 0) {
				continue;
			}

			this._transactions.set(poolAddress, data);

			const checkedTransactions: Map<string, IBaseTransaction> = new Map();

			for (const checkedMilestone of tradingToken.checkedStrategy.checkedMilestones) {
				checkedTransactions.set(checkedMilestone.id, checkedMilestone.delayedTransaction);
			}

			this.handleSwap(trading, tradingToken, checkedTransactions);
		}

		await this._tradingsService.updateTrading(trading.id, { disabled: false });
	}

	async stop(id: string) {
		const [trading, tradingTokens] = await Promise.all([
			this._tradingsService.getTrading({
				where: { id },
				relations: ["targetWallet"]
			}),
			this._tradingTokensService.repository.find({
				where: {
					trading: { id },
					disabled: false
				},
				relations: ["pool"]
			})
		]);

		const accountExclude = [trading.targetWallet.address];

		for (const tradingToken of tradingTokens) {
			accountExclude.push(tradingToken.pool.address);
		}

		this.stopTracking(...accountExclude);

		await this._tradingsService.updateTrading(trading.id, { disabled: true });
	}

	@OnEvent(EventsEnum.SOLANA_MESSAGE)
	handleSolanaMessage(message: ISolanaMessage) {
		if (!message?.params?.result?.transaction || message.params.result.transaction.meta.err) {
			return;
		}

		const date = new Date();
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
					createdAt: date,
					updatedAt: date
				};

				break;
			}

			if (SWAP_INSTRUCTIONS.includes(type)) {
				poolAddress = instruction.accounts[1];

				if (!this._swapSubjects.has(poolAddress)) {
					return;
				}

				instructionType = type;
				pool = this._pools.get(poolAddress);
				authority = pool.authority;
				baseMint = pool.baseMint;
				quoteMint = pool.quoteMint;

				break;
			}
		}

		if (!instructionType) {
			return;
		}

		if (this._signatures.has(signature)) {
			console.log(`Dublicate: ${signature}`);
			return;
		}

		this._signatures.add(signature);

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

		const basePrice = this._solanaPriceService.solanaPrice;

		const quoteChange = postQuoteAmount - preQuoteAmount;
		const baseChange = postBaseAmount - preBaseAmount;
		const transactionPrice = (Math.abs(baseChange) * basePrice) / Math.abs(quoteChange);
		const poolPrice = (Math.abs(postBaseAmount) * basePrice) / Math.abs(postQuoteAmount);

		if (INIT_INSTRUCTIONS.includes(instructionType) && (baseChange < 10 || quoteChange < 10_000)) {
			console.log(`Traitor transaction: ${signature}`);
			return;
		}

		if (!transactionPrice || !Number.isFinite(transactionPrice)) {
			console.log(`Something wrong with transaction price: ${signature}`);
			return;
		}

		if (!poolPrice || !Number.isFinite(poolPrice)) {
			console.log(`Something wrong with pool price: ${signature}`);
			return;
		}

		const tradingTransaction: ITradingTransaction = {
			instructionType,
			pool,
			date,
			author,
			signature,
			amount: quoteChange,
			price: transactionPrice,
			nextPrice: poolPrice
		};

		if (INIT_INSTRUCTIONS.includes(instructionType)) {
			this._createPoolSubjects.get(RAYDIUM_WALLET)?.next(tradingTransaction);
		} else if (SWAP_INSTRUCTIONS.includes(instructionType)) {
			this._swapSubjects.get(poolAddress).next(tradingTransaction);
		}
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

		this._createPoolSubjects.set(walletAddress, createPoolSubject);

		createPoolSubject.subscribe(async (transaction) => {
			const { date, pool } = transaction;
			const poolAddress = pool.address;

			if (this._transactions.has(poolAddress)) {
				return;
			}

			this._transactions.set(poolAddress, [transaction]);

			if (!this._pools.has(poolAddress)) {
				this._pools.set(poolAddress, pool);
			}

			const tradingToken: ITradingToken = {
				id: v4(),
				trading,
				pool,
				amount: 0,
				signaledAt: date,
				disabled: false,
				checkedStrategy: {
					...trading.strategy,
					checkedMilestones: [{ ...signalMilestone, checkedTransaction: transaction, delayedTransaction: transaction }]
				},
				createdAt: date,
				updatedAt: date
			};

			const checkedTransactions: Map<string, IBaseTransaction> = new Map();
			checkedTransactions.set(signalMilestone.id, transaction);
			this.handleSwap(trading, tradingToken, checkedTransactions);

			this._swapSubjects.get(poolAddress).next(transaction);
			this._eventsService.emit(EventsEnum.NEW_POOL_DETECTED, { transaction, tradingToken }, true);

			await this._tradingTokensService.createTradingToken(tradingToken);
		});

		this._solanaService.subscribeTransactions([walletAddress], [], CommitmentTypeEnum.PROCESSED);
	}

	handleSwap(trading: ITrading, tradingToken: ITradingToken, checkedTransactions: ICheckedTransactions) {
		const poolAddress = tradingToken.pool.address;

		if (!this._transactions.has(poolAddress)) {
			return;
		}

		const swapSubject = new Subject<ITradingTransaction>();
		const transactions = this._transactions.get(poolAddress);
		const sortedMilestones = trading.strategy.milestones.sort((a, b) => a.position - b.position);

		let pendingMilestone: IChecked<IMilestone>;
		let pendingSignature: string;

		this._tokens.set(poolAddress, tradingToken.amount);
		this._swapSubjects.set(poolAddress, swapSubject);

		swapSubject.subscribe(async (transaction) => {
			if (pendingMilestone || pendingSignature) {
				if (pendingSignature !== transaction.signature) {
					return;
				}

				const amount = this._tokens.get(poolAddress) - transaction.amount;
				this._tokens.set(poolAddress, amount);

				checkedTransactions.set(pendingMilestone.id, transaction);
				pendingMilestone.delayedTransaction = transaction;

				this._tradingTokensService.updateTradingToken(tradingToken.id, { amount }).then();
				this._eventsService.emit(
					EventsEnum.MILESTONE_CONFIRMED,
					{ trading, tradingToken, milestone: pendingMilestone },
					true
				);

				pendingMilestone = undefined;
				pendingSignature = undefined;
			}

			const [initTransaction] = transactions;
			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions.has(milestone.id));
			const tradingNotStarted = checkedMilestones.length < 2; // Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const duration = Math.floor((Date.now() - initTransaction.date.getTime()) / 1000);
			const isExpired = duration > trading.tokenTradingDuration;
			const isAllChecked = sortedMilestones.length === checkedMilestones.length;

			if (isAllChecked || (tradingNotStarted && isExpired)) {
				this.stopTracking(poolAddress);
				return;
			}

			transactions.push(transaction);

			for (const milestone of sortedMilestones) {
				if (checkedTransactions.has(milestone.id)) {
					continue;
				}

				const checkedTransaction = this._checkStrategiesService.getCheckedTransaction({
					strategy: trading.strategy,
					milestone,
					transactions,
					checkedTransactions
				});

				if (!checkedTransaction) {
					continue;
				}

				pendingMilestone = { ...milestone, checkedTransaction };

				const { sourceWallet, price, microLamports, units } = trading;
				const computeUnits: IComputeUnits = { microLamports, units };
				const pool = this._pools.get(poolAddress);
				const signer = this._signers.get(sourceWallet.address);

				if (milestone.type === MilestoneTypeEnum.BUY) {
					pendingSignature = await this.buy(pool, signer, price, computeUnits);
				}

				if (milestone.type === MilestoneTypeEnum.SELL) {
					const amount = this._tokens.get(poolAddress);
					pendingSignature = await this.sell(pool, signer, amount, computeUnits);
				}

				this._eventsService.emit(
					EventsEnum.MILESTONE_CHECKED,
					{ tradingToken, milestone, signature: pendingSignature },
					true
				);

				break;
			}
		});
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

	stopTracking(...accounts: string[]) {
		for (const account of accounts) {
			if (this._createPoolSubjects.has(account)) {
				this._createPoolSubjects.get(account)?.complete();
				this._createPoolSubjects.delete(account);
				continue;
			}

			if (this._swapSubjects.has(account)) {
				this._swapSubjects.get(account)?.complete();
				this._swapSubjects.delete(account);
				this._transactions.delete(account);
			}
		}

		const criteria = { pool: { address: In(accounts) } };

		this._tradingTokensService.updateTradingTokens(criteria, { disabled: true }).then();
	}
}
