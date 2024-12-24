/* eslint-disable prefer-destructuring */
import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import Big from "big.js";
import bs58 from "bs58";
import { Subject } from "rxjs";
import { v4 } from "uuid";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { CryptoService } from "../../libs/crypto";
import { DateService } from "../../libs/date";
import { FilesService } from "../../libs/files";
import { LoggerService } from "../../libs/logger";
import type { RaydiumInstruction } from "../../libs/raydium/enums/raydium-instruction.enum";
import { INIT_INSTRUCTIONS, SWAP_INSTRUCTIONS } from "../../libs/raydium/enums/raydium-instruction.enum";
import { SolanaPriceService } from "../../libs/solana";
import { PUMFUN_WALLET, RAYDIUM_WALLET, SOL_WALLET } from "../../libs/solana/constant/wallets.constant";
import { CommitmentTypeEnum } from "../../libs/solana/enums/commitment-type.enum";
import { ISolanaMessage } from "../../libs/solana/interfaces/solana-message.interface";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import type { IChecked, ICheckedTransactions } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import { CheckStrategyService } from "../../strategies/services/check-strategy.service";
import { StrategiesService } from "../../strategies/services/strategies.service";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import type { ITradingTransaction } from "../interfaces/trading-transaction.interface";
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

	private readonly _createPoolSubjects: Record<string, Subject<any>> = {};
	private readonly _swapSubjects: Record<string, Subject<any>> = {};
	private readonly _transactions: Record<string, ITradingTransaction[]> = {};
	private readonly _tokenAmounts: Record<string, number> = {};
	private readonly _poolKeys: Record<string, LiquidityPoolKeysV4> = {};

	constructor(
		private readonly _cryptoService: CryptoService,
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _tradingsService: TradingsService,
		private readonly _tradingTokensService: TradingTokensService,
		private readonly _strategiesService: StrategiesService,
		private readonly _checkStrategiesService: CheckStrategyService,
		private readonly _dateService: DateService,
		private readonly _loggerService: LoggerService,
		private readonly _eventsService: EventsService,
		private readonly _filesService: FilesService
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
			this.handlePoolCreate(trading);

			// TODO: Что бы перезапускать отслеживания монет после падения приложения нужно придумать как доставать транзакцию сигнала для первого значения массива
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

		const poolAddresses = findedTrading.tradingTokens.map((tradingToken) => tradingToken.poolAddress);

		this.unsubscribe([findedTrading.targetWallet.address, ...poolAddresses]);

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
		let poolKeys: LiquidityPoolKeysV4;
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
				poolKeys = {
					id: new PublicKey(poolAddress),
					baseMint: new PublicKey(baseMint),
					quoteMint: new PublicKey(quoteMint),
					lpMint: new PublicKey(instruction.accounts[7]),
					programId: new PublicKey(instruction.programId),
					authority: new PublicKey(authority),
					openOrders: new PublicKey(instruction.accounts[6]),
					targetOrders: new PublicKey(instruction.accounts[12]),
					baseVault: new PublicKey(instruction.accounts[10]),
					quoteVault: new PublicKey(instruction.accounts[11]),
					withdrawQueue: new PublicKey(SOL_WALLET),
					lpVault: new PublicKey(SOL_WALLET),
					marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
					marketId: new PublicKey(instruction.accounts[16]),
					marketAuthority: Market.getAssociatedAuthority({
						programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
						marketId: new PublicKey(instruction.accounts[16])
					}).publicKey,
					marketBaseVault: new PublicKey(instruction.accounts[20]),
					marketQuoteVault: new PublicKey(instruction.accounts[11]),
					marketBids: new PublicKey(instruction.accounts[12]),
					marketAsks: new PublicKey(instruction.accounts[12]),
					marketEventQueue: new PublicKey(SOL_WALLET),
					lookupTableAccount: new PublicKey(SOL_WALLET),
					baseDecimals: 9,
					quoteDecimals: 6,
					lpDecimals: 9,
					version: 4,
					marketVersion: 3
				};

				break;
			}

			if (SWAP_INSTRUCTIONS.includes(type)) {
				this._filesService.appendToFile("transactions.json", `${JSON.stringify(message)},\n`);

				poolAddress = instruction.accounts[1];

				if (!this._swapSubjects[poolAddress]) {
					return;
				}

				instructionType = type;
				poolKeys = this._poolKeys[poolAddress];
				authority = poolKeys.authority.toString();
				baseMint = poolKeys.baseMint.toString();
				quoteMint = poolKeys.quoteMint.toString();

				const [initTransaction] = this._transactions[poolAddress];
				const duration = date.diff(initTransaction.date, "s");

				if (duration > MINUTES_15) {
					this._solanaService.subscribeTransactions([], [poolAddress]);
					return;
				}

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
		const quotePrice = (Math.abs(baseChange) * basePrice) / Math.abs(quoteChange);

		const body: ITradingTransaction = {
			instructionType,
			poolKeys,
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
			this._createPoolSubjects[RAYDIUM_WALLET]?.next(body);
		} else if (SWAP_INSTRUCTIONS.includes(instructionType)) {
			this._swapSubjects[poolAddress].next(body);
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

		this._createPoolSubjects[walletAddress] = createPoolSubject;

		createPoolSubject.subscribe(async (transaction) => {
			const { poolAddress, quoteMint, baseMint, quotePrice, basePrice, date, poolKeys } = transaction;

			if (this._transactions[poolAddress]) {
				return;
			}

			this._transactions[poolAddress] = [transaction];
			this._poolKeys[poolAddress] = poolKeys;
			this._tokenAmounts[poolAddress] = 0;

			const tradingToken: ITradingToken = {
				id: v4(),
				signaledAt: date,
				walletAddress,
				poolAddress,
				basePrice: new Big(basePrice),
				baseMint,
				quotePrice: new Big(quotePrice),
				quoteMint,
				createdAt: new Date(),
				updatedAt: new Date(),
				trading
			};
			const checkedTransactions: ICheckedTransactions = { [signalMilestone.id]: transaction };

			this.handleSwap(trading, tradingToken, checkedTransactions);

			this._swapSubjects[poolAddress].next(transaction);

			this._eventsService.emit(EventsEnum.SIGNALED, { trading, transaction }, true);

			await this._tradingTokensService.createTradingToken({
				...tradingToken,
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
			const [firstTransaction] = transactions;

			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions[milestone.id]);
			const duration = this._dateService.now().diff(firstTransaction.date, "s");

			// Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const isTradingStartedAndNotOver =
				checkedMilestones.length > 1 && checkedMilestones.length < sortedMilestones.length;
			const isExpired = duration > trading.tokenTradingDuration;

			if (isExpired && !isTradingStartedAndNotOver) {
				this.unsubscribe([poolAddress]);
				return;
			}

			transactions.push(transaction);

			if (pendingMilestone || pendingSignature) {
				if (pendingSignature !== transaction.signature) {
					return;
				}

				this._tokenAmounts[poolAddress] -= transaction.quoteChange;

				pendingMilestone.delayedTransaction = transaction;
				checkedTransactions[pendingMilestone.id] = transaction;

				this._eventsService.emit(
					EventsEnum.MILESTONE_CONFIRMED,
					{ trading, tradingToken, milestone: pendingMilestone },
					true
				);

				pendingMilestone = undefined;
				pendingSignature = undefined;

				if (sortedMilestones.length === checkedMilestones.length) {
					this.unsubscribe([poolAddress]);
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
					pendingSignature = await this.buy(
						poolAddress,
						trading.sourceWallet.secret,
						trading.price.toNumber(),
						trading.microLamports,
						trading.units
					);
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					pendingSignature = await this.sell(
						poolAddress,
						trading.sourceWallet.secret,
						this._tokenAmounts[poolAddress],
						trading.microLamports,
						trading.units
					);
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

	unsubscribe(accounts: string[]) {
		for (const account of accounts) {
			this._createPoolSubjects[account]?.complete();
			this._swapSubjects[account]?.complete();

			delete this._createPoolSubjects[account];
			delete this._swapSubjects[account];
		}
	}

	buy(poolAddress: string, cryptedSecret: string, amount: number, microLamports?: number, units?: number) {
		const secret = this._cryptoService.decrypt(cryptedSecret);
		const owner = Keypair.fromSecretKey(bs58.decode(secret));
		const poolKeys = this._poolKeys[poolAddress];

		if (!poolKeys) {
			return;
		}

		return this._solanaService.swap({
			owner,
			poolKeys,
			from: poolKeys.baseMint,
			to: poolKeys.quoteMint,
			amount,
			microLamports,
			units,
			skipPreflight: true,
			preflightCommitment: "processed",
			maxRetries: 1
		});
	}

	sell(poolAddress: string, cryptedSecret: string, amount: number, microLamports?: number, units?: number) {
		const secret = this._cryptoService.decrypt(cryptedSecret);
		const owner = Keypair.fromSecretKey(bs58.decode(secret));
		const poolKeys = this._poolKeys[poolAddress];

		if (!poolKeys) {
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
			maxRetries: 1
		});
	}
}
