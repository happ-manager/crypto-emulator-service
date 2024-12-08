import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { TransactionTypeEnum } from "../../../candles/enums/transaction-type.enum";
import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { DateService } from "../../date";
import { FilesService } from "../../files";
import { LoggerService } from "../../logger";
import { INIT_LOG, TRANSFER_LOG } from "../constant/logs.constant";
import { PUMFUN_WALLET, RADIUM_WALLET, SPL_TOKEN_PROGRAM, WSOL_WALLET } from "../constant/wallets.constant";
import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import { SOLANA_CONFIG } from "../injection-tokens/solana-config.injection-token";
import { ISolanaConfig } from "../interfaces/solana-config.interface";
import { ISolanaMessage } from "../interfaces/solana-message.interface";
import type { ISolanaTransaction } from "../interfaces/solana-transaction.interface";
import { SolanaPriceService } from "./solana-price.service";
import { SwapService } from "./swap.service";

@Injectable()
export class SolanaService {
	private _accounts = {};

	constructor(
		@Inject(SOLANA_CONFIG) private readonly _solanaConfig: ISolanaConfig,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _dateService: DateService,
		private readonly _swapService: SwapService,
		private readonly _loggerService: LoggerService,
		private readonly _eventsService: EventsService,
		private readonly _filesService: FilesService
	) {}

	@OnEvent(EventsEnum.SOLANA_PROVIDER_MESSAGE)
	handleSolanaMessage(message: ISolanaMessage) {
		const date = this._dateService.now();

		if (!message?.params?.result?.transaction) {
			return;
		}

		const { meta, transaction } = message.params.result.transaction;
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
		let isPumpFun = false;
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

		const price = this._solanaPriceService.computeMemeTokenPrice(prices);
		const body: ISolanaTransaction = {
			type,
			price,
			walletAddress,
			poolAddress,
			date,
			authories,
			prices,
			tokenMint,
			signature: message?.params?.result?.signature
		};

		this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION, body);
	}

	async buy(pollAddress: string, price: number, secret: string) {
		try {
			return await this._swapService.buyToken(pollAddress, price, secret);
		} catch (error) {
			this._loggerService.error(error, "buy");
		}
	}

	async sell(pollAddress: string, secret: string) {
		try {
			return await this._swapService.sellToken(pollAddress, secret);
		} catch (error) {
			this._loggerService.error(error, "sell");
		}
	}

	send(accountInclude: string[], accountExclude: string[], commitmentType?: CommitmentTypeEnum) {
		this._solanaConfig.provider.send(accountInclude, accountExclude, commitmentType);

		this._eventsService.emit(EventsEnum.SOLANA_SEND, { accountInclude, accountExclude, commitmentType }, true);

		for (const account of accountInclude) {
			this._accounts[account] = true;
		}

		for (const account of accountExclude) {
			delete this._accounts[account];
		}
	}

	getTransactions(pollAddress: string, signature?: string) {
		return this._solanaConfig.provider.getTransactions(pollAddress, signature);
	}
}
