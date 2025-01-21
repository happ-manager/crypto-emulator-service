/* eslint-disable prefer-destructuring */
import { getCheckedTransaction, IChecked, IMilestone, MilestoneTypeEnum } from "@happ-manager/crypto-api";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { Subscription } from "rxjs";

import { EventsEnum } from "../../shared/enums/events.enum";
import { IBaseTransaction } from "../../shared/interfaces/base-transactio.interface";
import { IPool } from "../../shared/interfaces/pool.interface";
import { HeliusService } from "../../shared/modules/helius/services/helius.service";
import { SolanaPriceService } from "../../shared/modules/solana";
import { PUMFUN_WALLET, RAYDIUM_WALLET, SOL_WALLET } from "../../shared/modules/solana/constant/wallets.constant";
import { CommitmentTypeEnum } from "../../shared/modules/solana/enums/commitment-type.enum";
import {
	INIT_INSTRUCTIONS,
	RaydiumInstruction,
	SWAP_INSTRUCTIONS
} from "../../shared/modules/solana/enums/raydium-instruction.enum";
import { IComputeUnits } from "../../shared/modules/solana/interfaces/compute-units.interface";
import { ISolanaMessage } from "../../shared/modules/solana/interfaces/solana-message.interface";
import { SolanaService } from "../../shared/modules/solana/services/solana.service";
import { ITradingProps } from "../interfaces/trading.interface";

@Injectable()
export class TradingService {
	private readonly _loggerService = new Logger("AutoTradingService");

	private _subscribtion: Subscription;
	private _interval: NodeJS.Timeout;

	constructor(
		private readonly _solanaService: SolanaService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _eventsService: EventEmitter2,
		private readonly _heliusService: HeliusService
	) {}

	start(tradingProps: ITradingProps) {
		if (this._subscribtion) {
			return null;
		}

		const { strategy, tokenTradingDuration, targetWallet, microLamports, units, price, secret } = tradingProps;

		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);
		const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

		if (!signalMilestone) {
			this._loggerService.warn("У стратегии должен быть сигнал");
			return;
		}

		const computeUnits: IComputeUnits = { microLamports, units };
		const signer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(secret)));
		const signaturesSet = new Set<string>();
		const amountsMap = new Map<string, number>();
		const poolsMap = new Map<string, IPool>();
		const transactionsMap = new Map<string, IBaseTransaction[]>();
		const checkedTransactionsMap = new Map<string, Map<string, IBaseTransaction>>();
		const pendingSignaturesMap = new Map<string, string>();
		const pendingMilestonesMap = new Map<string, IChecked<IMilestone>>();

		this._subscribtion = this._heliusService.messageSubject.subscribe(async (message: ISolanaMessage) => {
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
						marketVersion: 3
					};

					poolsMap.set(poolAddress, pool);
					transactionsMap.set(poolAddress, []);
					checkedTransactionsMap.set(poolAddress, new Map());
					amountsMap.set(poolAddress, 0);

					break;
				}

				if (SWAP_INSTRUCTIONS.includes(type)) {
					poolAddress = instruction.accounts[1];

					if (!poolsMap.has(poolAddress)) {
						return;
					}

					instructionType = type;
					pool = poolsMap.get(poolAddress);
					authority = pool.authority;
					baseMint = pool.baseMint;
					quoteMint = pool.quoteMint;

					break;
				}
			}

			if (!instructionType || signaturesSet.has(signature)) {
				return;
			}

			signaturesSet.add(signature);

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

			const quoteChange = postQuoteAmount - preQuoteAmount;
			const baseChange = postBaseAmount - preBaseAmount;

			if (INIT_INSTRUCTIONS.includes(instructionType) && (baseChange < 10 || quoteChange < 10_000)) {
				console.log(`Traitor detected: ${signature}`);
				return;
			}

			const transactionPrice = (Math.abs(baseChange) * this._solanaPriceService.solanaPrice) / Math.abs(quoteChange);

			if (!transactionPrice || !Number.isFinite(transactionPrice)) {
				console.log(`Something wrong with transaction price: ${signature}`);
				return;
			}

			const poolPrice = (Math.abs(postBaseAmount) * this._solanaPriceService.solanaPrice) / Math.abs(postQuoteAmount);

			if (!poolPrice || !Number.isFinite(poolPrice)) {
				console.log(`Something wrong with pool price: ${signature}`);
				return;
			}

			const checkedTransactions = checkedTransactionsMap.get(poolAddress);
			const pendingSignature = pendingSignaturesMap.get(poolAddress);
			const pendingMilestone = pendingMilestonesMap.get(poolAddress);
			const baseTransaction: IBaseTransaction = {
				author,
				date,
				price: transactionPrice
			};

			if (pendingSignature || pendingMilestone) {
				if (pendingSignature !== signature) {
					return;
				}

				amountsMap.set(poolAddress, amountsMap.get(poolAddress) - quoteChange);
				checkedTransactions.set(pendingMilestone.id, baseTransaction);
				pendingMilestone.delayedTransaction = baseTransaction;

				this._eventsService.emit(EventsEnum.MILESTONE_CONFIRMED, { milestone: pendingMilestone }, true);

				pendingMilestonesMap.set(poolAddress, undefined);
				pendingSignaturesMap.set(poolAddress, undefined);
			}

			if (INIT_INSTRUCTIONS.includes(instructionType)) {
				console.log("LETS GO");
				checkedTransactions.set(signalMilestone.id, baseTransaction);
				this._eventsService.emit(EventsEnum.NEW_POOL_DETECTED, { transaction: baseTransaction }, true);
			}

			const transactions = transactionsMap.get(poolAddress);

			transactions.push(baseTransaction);

			const [initTransaction] = transactions;
			const checkedMilestones = sortedMilestones.filter((milestone) => checkedTransactions.has(milestone.id));
			const tradingNotStarted = checkedMilestones.length < 2; // Первое выполненое условие - "Сигнал". Если их > 1 - значит была "Покупка"
			const duration = Math.floor((Date.now() - initTransaction.date.getTime()) / 1000);
			const isExpired = duration > tokenTradingDuration;
			const isAllChecked = sortedMilestones.length === checkedMilestones.length;

			if (isAllChecked || (tradingNotStarted && isExpired)) {
				amountsMap.delete(poolAddress);
				poolsMap.delete(poolAddress);
				transactionsMap.delete(poolAddress);
				checkedTransactionsMap.delete(poolAddress);
				pendingMilestonesMap.delete(poolAddress);
				pendingSignaturesMap.delete(poolAddress);
				return;
			}

			for (const milestone of sortedMilestones) {
				if (checkedTransactions.has(milestone.id)) {
					continue;
				}

				const checkedTransaction = getCheckedTransaction({
					strategy,
					milestone,
					transactions,
					checkedTransactions
				});

				if (!checkedTransaction) {
					continue;
				}

				pendingMilestonesMap.set(poolAddress, { ...milestone, checkedTransaction });

				if (milestone.type === MilestoneTypeEnum.BUY) {
					const amount = price / this._solanaPriceService.solanaPrice;

					const swapSignature = await this._solanaService.swap(
						new PublicKey(pool.baseMint),
						new PublicKey(pool.quoteMint),
						amount,
						signer,
						pool,
						computeUnits
					);

					pendingSignaturesMap.set(poolAddress, swapSignature);
				}

				if (milestone.type === MilestoneTypeEnum.SELL) {
					const amount = amountsMap.get(poolAddress);

					const swapSignature = await this._solanaService.swap(
						new PublicKey(pool.quoteMint),
						new PublicKey(pool.baseMint),
						amount,
						signer,
						pool,
						computeUnits
					);

					pendingSignaturesMap.set(poolAddress, swapSignature);
				}

				this._eventsService.emit(EventsEnum.MILESTONE_CHECKED, { milestone, signature: pendingSignature }, true);

				break;
			}
		});

		this._solanaService.subscribeTransactions([targetWallet], [], CommitmentTypeEnum.PROCESSED);

		this._interval = setInterval(() => {
			signaturesSet.clear();
		}, 10_000);
	}

	stop(targetWallet: string) {
		if (!this._subscribtion || !this._interval) {
			return;
		}

		this._subscribtion.unsubscribe();
		clearInterval(this._interval);

		this._solanaService.subscribeTransactions([], [targetWallet], CommitmentTypeEnum.PROCESSED);
	}
}
