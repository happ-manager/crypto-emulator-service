import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { LiquidityPoolKeysV4 } from "@raydium-io/raydium-sdk";
import { MAINNET_PROGRAM_ID, Market } from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";
import Big from "big.js";

import { TransactionTypeEnum } from "../../../candles/enums/transaction-type.enum";
import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { DateService } from "../../date";
import { FilesService } from "../../files";
import { HeliusService } from "../../helius/services/helius.service";
import { RaydiumService } from "../../raydium/services/raydium.service";
import { INIT_LOG, TRANSFER_LOG } from "../constant/logs.constant";
import { PUMFUN_WALLET, RADIUM_WALLET, SPL_TOKEN_PROGRAM, WSOL_WALLET } from "../constant/wallets.constant";
import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import type { IDexSwap, IDexWrap } from "../interfaces/dex.interface";
import { ISolanaMessage } from "../interfaces/solana-message.interface";
import type { ISolanaInTransaction } from "../interfaces/solana-transaction.interface";
import { SolanaBlockhashService } from "./solana-blockhash.service";
import { SolanaPriceService } from "./solana-price.service";

@Injectable()
export class SolanaService {
	private _accounts = {};

	constructor(
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _solanaBlockhashService: SolanaBlockhashService,
		private readonly _dateService: DateService,
		private readonly _eventsService: EventsService,
		private readonly _raydiumService: RaydiumService,
		private readonly _heliusService: HeliusService,
		private readonly _filesService: FilesService
	) {}

	get blockhash() {
		return this._solanaBlockhashService.blockhash;
	}

	get rpc() {
		return this._heliusService;
	}

	@OnEvent(EventsEnum.SOLANA_PROVIDER_MESSAGE)
	handleSolanaMessage(message: ISolanaMessage) {
		const date = this._dateService.now();

		if (!message?.params?.result?.transaction) {
			return;
		}

		const { meta, transaction } = message.params.result.transaction;

		if (meta.err) {
			return;
		}

		const instructions = [
			...(transaction.message?.instructions || []),
			...(meta?.innerInstructions?.flatMap((inner) => inner.instructions) || [])
		];

		let type: TransactionTypeEnum;

		for (const logMessage of meta.logMessages || []) {
			if (logMessage.includes(TRANSFER_LOG)) {
				type = TransactionTypeEnum.TRANSFER;
			} else if (logMessage.includes(INIT_LOG)) {
				type = TransactionTypeEnum.INIT;
			}

			if (type) {
				break;
			}
		}

		if (!type) {
			return;
		}

		const prices: number[] = [];
		const authories: string[] = [];

		let poolAddress = null;
		let walletAddress = null;
		let isPumpFun = true;
		let tokenMint = null;

		for (const instruction of instructions) {
			const { accounts = [], parsed, programId } = instruction;
			const { amount, authority, source } = parsed?.info || {};

			if (amount) {
				prices.push(amount);
			}

			if (authority) {
				authories.push(authority);
			}

			if (type === TransactionTypeEnum.TRANSFER) {
				if (!walletAddress && source === WSOL_WALLET && parsed) {
					walletAddress = authority;
				}

				if (!poolAddress && accounts[1]) {
					// eslint-disable-next-line prefer-destructuring
					poolAddress = accounts[1];
				}
			}

			if (type === TransactionTypeEnum.INIT) {
				if (!isPumpFun && accounts.includes(PUMFUN_WALLET)) {
					isPumpFun = true;
				}

				if (!walletAddress && isPumpFun) {
					walletAddress = RADIUM_WALLET;
				}

				if (!poolAddress && isPumpFun && accounts[4]) {
					// eslint-disable-next-line prefer-destructuring
					poolAddress = accounts[4];
				}

				if (!tokenMint && programId === SPL_TOKEN_PROGRAM) {
					if (parsed?.type === "initializeMint") {
						tokenMint = parsed.info.mint;
					} else if (accounts.length > 1) {
						// eslint-disable-next-line prefer-destructuring
						tokenMint = accounts[1];
					}
				}
			}
		}

		const transferCheck = type === TransactionTypeEnum.TRANSFER && this._accounts[poolAddress];
		const initCheck = type === TransactionTypeEnum.INIT && walletAddress && poolAddress;

		if (!transferCheck && !initCheck) {
			return;
		}

		let poolKeys: LiquidityPoolKeysV4;

		let price = this._solanaPriceService.getTokenPrice(prices);

		if (initCheck) {
			const accountKeys = transaction.message.accountKeys.map((accountKey) => accountKey.pubkey);
			poolKeys = {
				id: new PublicKey(accountKeys[2]),
				baseMint: new PublicKey(accountKeys[13]),
				quoteMint: new PublicKey(accountKeys[18]),
				lpMint: new PublicKey(accountKeys[4]),
				programId: new PublicKey(accountKeys[15]),
				authority: new PublicKey(accountKeys[17]),
				openOrders: new PublicKey(accountKeys[3]),
				targetOrders: new PublicKey(accountKeys[7]),
				baseVault: new PublicKey(accountKeys[5]),
				quoteVault: new PublicKey(accountKeys[6]),
				withdrawQueue: new PublicKey("11111111111111111111111111111111"),
				lpVault: new PublicKey("11111111111111111111111111111111"),
				marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
				marketId: new PublicKey(accountKeys[21]),
				marketAuthority: Market.getAssociatedAuthority({
					programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
					marketId: new PublicKey(accountKeys[21])
				}).publicKey,
				marketBaseVault: new PublicKey(accountKeys[5]),
				marketQuoteVault: new PublicKey(accountKeys[6]),
				marketBids: new PublicKey(accountKeys[7]),
				marketAsks: new PublicKey(accountKeys[7]),
				marketEventQueue: new PublicKey("11111111111111111111111111111111"),
				lookupTableAccount: new PublicKey("11111111111111111111111111111111"),
				baseDecimals: 9,
				quoteDecimals: 6,
				lpDecimals: 9,
				version: 4,
				marketVersion: 3
			};

			const [firstToken, secondToken] = meta.postTokenBalances;

			// Достаём значения балансов
			const firstTokenAmount = Number.parseFloat(firstToken.uiTokenAmount.amount);
			const secondTokenAmount = Number.parseFloat(secondToken.uiTokenAmount.amount);

			if (firstToken.mint === WSOL_WALLET) {
				// Рассчитываем цену одного memeToken
				const wsolTotalValueUSD = firstTokenAmount * this._solanaPriceService.solanaPrice;
				const memeTokenPriceUSD = wsolTotalValueUSD / secondTokenAmount;
				price = new Big(memeTokenPriceUSD);
			} else {
				// Рассчитываем цену одного memeToken
				const wsolTotalValueUSD = secondTokenAmount * this._solanaPriceService.solanaPrice;
				const memeTokenPriceUSD = wsolTotalValueUSD / firstTokenAmount;
				price = new Big(memeTokenPriceUSD);
			}
		}

		let tokenAmount = 0;

		if (transferCheck) {
			const [sellToken, boughtToken] = transferCheck ? meta.postTokenBalances : [undefined, undefined];
			tokenAmount =
				sellToken.mint === WSOL_WALLET ? boughtToken.uiTokenAmount?.uiAmount : sellToken.uiTokenAmount?.uiAmount;
		}

		const body: ISolanaInTransaction = {
			type,
			price,
			walletAddress,
			poolAddress,
			date,
			authories,
			prices,
			tokenMint,
			tokenAmount,
			poolKeys,
			message
		};

		this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION, body);
	}

	subscribeTransactions(accountInclude: string[], accountExclude: string[], commitmentType?: CommitmentTypeEnum) {
		this._heliusService.subscribeTransactions(accountInclude, accountExclude, commitmentType);

		this._eventsService.emit(EventsEnum.SOLANA_SEND, { accountInclude, accountExclude, commitmentType }, true);

		for (const account of accountInclude) {
			this._accounts[account] = true;
		}

		for (const account of accountExclude) {
			delete this._accounts[account];
		}
	}

	swap(dexSwap: IDexSwap) {
		return this._raydiumService.swap(dexSwap);
	}

	wrap(dexWrap: IDexWrap) {
		return this._raydiumService.wrap(dexWrap);
	}
}
