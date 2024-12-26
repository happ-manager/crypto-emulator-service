/* eslint-disable prefer-destructuring */
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import Big from "big.js";
import bs58 from "bs58";
import { Subject } from "rxjs";
import { v4 } from "uuid";

import { TransactionsService } from "../../candles/services/transactions.service";
import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { CryptoService } from "../../libs/crypto";
import { DateService } from "../../libs/date";
import { LoggerService } from "../../libs/logger";
import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import {
	INIT_INSTRUCTIONS,
	SWAP_INSTRUCTIONS
} from "../../libs/raydium/enums/raydium-instruction.enum";
import { SolanaPriceService } from "../../libs/solana";
import { PUMFUN_WALLET, RAYDIUM_WALLET, SOL_WALLET } from "../../libs/solana/constant/wallets.constant";
import { CommitmentTypeEnum } from "../../libs/solana/enums/commitment-type.enum";
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
	private readonly _tradingRelations = [
		"sourceWallet",
		"targetWallet",
		"strategy",
		...this._strategiesService.relations.map((relation) => `strategy.${relation}`)
	];

	private readonly _createPoolSubjects: Record<string, Subject<ITradingTransaction>> = {};
	private readonly _swapSubjects: Record<string, Subject<ITradingTransaction>> = {};
	private readonly _transactions: Record<string, IBaseTransaction[]> = {};

	private readonly _tokens: Record<string, number> = {};
	private readonly _pools: Record<string, IPool> = {};
	private readonly _signers: Record<string, Keypair> = {};

	constructor(
		private readonly _cryptoService: CryptoService,
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

	onModuleInit() {
		setTimeout(this.init.bind(this), 3000);
	}

	async init() {
		const tradings = await this._tradingsService.getTradings({
			where: { disabled: false },
			relations: [...this._tradingRelations, "tradingTokens", "tradingTokens.pool"]
		});

		for (const trading of tradings.data) {
			const signalMilestone = trading.strategy.milestones.find(
				(milestone) => milestone.type === MilestoneTypeEnum.SIGNAL
			);

			if (!signalMilestone) {
				this._loggerService.warn("У стратегии должен быть сигнал");
				continue;
			}

			if (!this._signers[trading.sourceWallet.address]) {
				const decrypted = this._cryptoService.decrypt(trading.sourceWallet.secret);
				const decoded = bs58.decode(decrypted);
				this._signers[trading.sourceWallet.address] = Keypair.fromSecretKey(decoded);
			}

			this.handlePoolCreate(trading);

			for (const tradingToken of trading.tradingTokens) {
				if (!tradingToken.active) {
					continue;
				}

				if (!this._pools[tradingToken.pool.address]) {
					this._pools[tradingToken.pool.address] = tradingToken.pool;
				}

				const { data } = await this._transactionsService.getTransactions({
					where: {
						poolAddress: tradingToken.poolAddress
					},
					order: { date: "asc" }
				});

				const [initialTransaction] = data;

				if (!initialTransaction) {
					continue;
				}

				const checkedTransactions: ICheckedTransactions = { [signalMilestone.id]: initialTransaction };
				this._transactions[tradingToken.poolAddress] = data;
				this._tokens[tradingToken.poolAddress] = tradingToken.amount;
				this.handleSwap(trading, tradingToken, checkedTransactions);
			}
		}
	}

	async start(id: string) {
		const findedTrading = await this._tradingsService.getTrading({ where: { id }, relations: this._tradingRelations });

		if (!findedTrading) {
			return;
		}

		this.handlePoolCreate(findedTrading);

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

		const accountExclude = [findedTrading.targetWallet.address];

		this._createPoolSubjects[findedTrading.targetWallet.address]?.complete();
		delete this._createPoolSubjects[findedTrading.targetWallet.address];

		for (const tradingToken of findedTrading.tradingTokens) {
			if (!tradingToken.active) {
				continue;
			}

			this._swapSubjects[tradingToken.poolAddress]?.complete();
			delete this._swapSubjects[tradingToken.poolAddress];
			accountExclude.push(tradingToken.poolAddress);
		}

		this._solanaService.subscribeTransactions([], accountExclude);

		await this._tradingsService.updateTrading(findedTrading.id, { disabled: true });
	}

	@OnEvent(EventsEnum.SOLANA_MESSAGE)
	handleSolanaMessage(message: ISolanaMessage) {
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
		const quoteChange = postQuoteAmount - preQuoteAmount;
		const basePrice = this._solanaPriceService.solanaPrice;
		const quotePrice = quoteChange === 0 ? 0 : (Math.abs(baseChange) * basePrice) / Math.abs(quoteChange);

		const tradingTransaction: ITradingTransaction = {
			instructionType,
			pool,
			poolAddress,
			baseMint,
			quoteMint,
			basePrice,
			quotePrice,
			baseChange,
			quoteChange,
			date,
			author,
			price: new Big(quotePrice),
			signature
		};

		if (INIT_INSTRUCTIONS.includes(instructionType)) {
			this._createPoolSubjects[RAYDIUM_WALLET]?.next(tradingTransaction);
		} else if (SWAP_INSTRUCTIONS.includes(instructionType)) {
			this._swapSubjects[poolAddress].next(tradingTransaction);
		}

		this._eventsService.emit(EventsEnum.TRADING_TRANSACTION, tradingTransaction);
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
			const { poolAddress, quoteMint, baseMint, quotePrice, basePrice, date, pool } = transaction;

			if (this._transactions[poolAddress]) {
				return;
			}

			this._transactions[poolAddress] = [transaction];
			this._pools[poolAddress] = pool;
			this._tokens[poolAddress] = 0;

			const tradingToken: ITradingToken = {
				id: v4(),
				signaledAt: date,
				amount: 0,
				walletAddress,
				poolAddress,
				basePrice: new Big(basePrice),
				baseMint,
				quotePrice: new Big(quotePrice),
				quoteMint,
				active: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				trading
			};
			const checkedTransactions: ICheckedTransactions = { [signalMilestone.id]: transaction };

			this.handleSwap(trading, tradingToken, checkedTransactions);

			this._swapSubjects[poolAddress].next(transaction);

			this._eventsService.emit(EventsEnum.SIGNALED, { trading, transaction }, true);

			const token: Partial<IToken> = {
				chain: "solana",
				poolAddress,
				tokenAddress: pool.quoteMint
			};

			await this._tradingTokensService.createTradingToken({
				...tradingToken,
				pool,
				token,
				checkedStrategy: {
					...trading.strategy,
					checkedMilestones: [{ ...signalMilestone, checkedTransaction: transaction, delayedTransaction: transaction }]
				}
			});
		});

		this._solanaService.subscribeTransactions([trading.targetWallet.address], [], CommitmentTypeEnum.PROCESSED);
	}

	handleSwap(trading: ITrading, tradingToken: ITradingToken, checkedTransactions: ICheckedTransactions) {
		const { poolAddress } = tradingToken;

		if (!this._transactions[poolAddress]) {
			return;
		}

		const transactions = this._transactions[poolAddress];
		const sortedMilestones = trading.strategy.milestones.sort((a, b) => a.position - b.position);

		let pendingMilestone: IChecked<IMilestone>;
		let pendingSignature: string;

		const swapSubject = new Subject<ITradingTransaction>();

		this._swapSubjects[poolAddress] = swapSubject;

		swapSubject.subscribe(async (transaction) => {
			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions[milestone.id]);

			if (pendingMilestone || pendingSignature) {
				if (pendingSignature !== transaction.signature) {
					return;
				}

				this._tokens[poolAddress] -= transaction.quoteChange;
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
			const tradingNotStarted = checkedMilestones.length < 2; // Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const duration = this._dateService.now().diff(initTransaction.date, "s");
			const isExpired = duration > trading.tokenTradingDuration;
			const isAllChecked = sortedMilestones.length === checkedMilestones.length;

			if (isAllChecked || (tradingNotStarted && isExpired)) {
				this._solanaService.subscribeTransactions([], [tradingToken.poolAddress]);
				this._tradingTokensService.updateTradingToken(tradingToken.id, { active: false }).then();
				this._swapSubjects[tradingToken.poolAddress]?.complete();
				delete this._swapSubjects[tradingToken.poolAddress];
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

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					pendingSignature = await this.buy(poolAddress, sourceWallet.address, price, microLamports, units);
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					pendingSignature = await this.sell(poolAddress, sourceWallet.address, microLamports, units);
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

	buy(poolAddress: string, walletAddress: string, amountInUsd: number, microLamports: number, units: number) {
		const signer = this._signers[walletAddress];
		const pool = this._pools[poolAddress];
		const amount = amountInUsd / this._solanaPriceService.solanaPrice;

		if (!signer || !pool) {
			console.log({ signer, pool });
			this._loggerService.error(`Something missing`, "buy");
			return;
		}

		return this._solanaService.swap({
			signer,
			pool,
			from: pool.baseMint,
			to: pool.quoteMint,
			amount,
			microLamports,
			units,
			skipPreflight: true,
			preflightCommitment: CommitmentTypeEnum.PROCESSED,
			maxRetries: 1
		});
	}

	sell(poolAddress: string, walletAddress: string, microLamports: number, units: number) {
		const signer = this._signers[walletAddress];
		const pool = this._pools[poolAddress];
		const amount = this._tokens[poolAddress];

		if (!signer || !pool || !amount) {
			this._loggerService.error("Something missing", "sell");
			return;
		}

		return this._solanaService.swap({
			signer,
			pool,
			from: pool.quoteMint,
			to: pool.baseMint,
			amount,
			microLamports,
			units,
			skipPreflight: true,
			preflightCommitment: CommitmentTypeEnum.PROCESSED,
			maxRetries: 1
		});
	}

	async setVariables(pool: IPool, walletAddress: string, amount?: number) {
		if (!this._pools[pool.address]) {
			this._pools[pool.address] = pool;
		}

		if (!this._signers[walletAddress]) {
			const wallet = await this._walletsService.getWallet({ where: { address: walletAddress } });
			const decrypted = this._cryptoService.decrypt(wallet.secret);
			const decoded = bs58.decode(decrypted);
			this._signers[walletAddress] = Keypair.fromSecretKey(decoded);
		}

		if (amount) {
			this._tokens[pool.address] = amount;
		}
	}
}
