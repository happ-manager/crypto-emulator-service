/* eslint-disable prefer-destructuring */
import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Subject } from "rxjs";

import { EventsEnum } from "../../../events/enums/events.enum";
import { DateService } from "../../date";
import { LoggerService } from "../../logger";
import { PUMFUN_WALLET, RADIUM_WALLET, WSOL_WALLET } from "../constant/wallets.constant";
import { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import { SubscribtionTypeEnum } from "../enums/subscribtion-type.enum";
import { SOLANA_CONFIG } from "../injection-tokens/solana-config.injection-token";
import { ISolanaConfig } from "../interfaces/solana-config.interface";
import { ISolanaMessage } from "../interfaces/solana-message.interface";
import type { ISolanaTransaction } from "../interfaces/solana-transaction.interface";
import { checkIsInit } from "../utils/check-is-init.util";
import { checkIsTransfer } from "../utils/check-is-transfer.util";
import { SolanaPriceService } from "./solana-price.service";
import { SwapService } from "./swap.service";

@Injectable()
export class SolanaService {
	readonly _buySubscribers: Record<string, Subject<ISolanaTransaction>> = {};
	readonly _priceSubscribers: Record<string, Subject<ISolanaTransaction>> = {};

	constructor(
		@Inject(SOLANA_CONFIG) private readonly _solanaConfig: ISolanaConfig,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _dateService: DateService,
		private readonly _swapService: SwapService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.HELIUS_MESSAGE)
	handleTransfer(message: ISolanaMessage) {
		const date = this._dateService.now();

		const isTransfer = checkIsTransfer(message);

		if (!isTransfer) {
			return;
		}

		const { meta, transaction } = message.params.result.transaction;

		const instructions = [
			...(transaction.message?.instructions || []),
			...meta.innerInstructions.reduce((pre, cur) => [...pre, ...cur.instructions], [])
		];
		const prices: number[] = [];
		const authories: string[] = [];

		let poolAddress = null;
		let walletAddress = null;

		for (const instruction of instructions) {
			const { accounts = [], parsed } = instruction;
			const { amount, authority, source } = parsed?.info || {};

			if (amount) {
				prices.push(amount);
			}

			if (authority) {
				authories.push(authority);
			}

			if (!walletAddress && source === WSOL_WALLET && parsed) {
				walletAddress = authority;
			}

			if (!poolAddress && accounts[1]) {
				poolAddress = accounts[1];
			}
		}

		const isBuy = walletAddress && this._buySubscribers[walletAddress];
		const isPrice = poolAddress && this._priceSubscribers[poolAddress];

		if (!isBuy && !isPrice) {
			return;
		}

		const price = this._solanaPriceService.computeMemeTokenPrice(prices);
		const body: ISolanaTransaction = {
			price,
			walletAddress,
			poolAddress,
			date,
			authories,
			signature: message?.params?.result?.signature
		};

		// Если это покупка - то мы ищем по адресу кошелька. Если это осталеживание по цене - мы ищем по адрес пула
		if (isBuy) {
			this._buySubscribers[walletAddress].next(body);
		} else if (isPrice) {
			this._priceSubscribers[poolAddress].next(body);
		}
	}

	@OnEvent(EventsEnum.HELIUS_MESSAGE)
	handleInit(message: ISolanaMessage) {
		const date = this._dateService.now();

		const isInit = checkIsInit(message);

		if (!isInit) {
			return;
		}

		const { instructions = [] } = message.params?.result?.transaction?.transaction?.message;
		const prices: number[] = [];
		const authories: string[] = [];

		let poolAddress = null;
		let walletAddress = null;
		let isPumpFun = false;

		for (const instruction of instructions) {
			const { accounts = [], parsed } = instruction;
			const { amount, authority } = parsed?.info || {};

			if (!isPumpFun && accounts.includes(PUMFUN_WALLET)) {
				isPumpFun = true;
			}

			if (amount) {
				prices.push(amount);
			}

			if (authority) {
				authories.push(authority);
			}

			if (!walletAddress && isPumpFun) {
				walletAddress = RADIUM_WALLET;
			}

			if (!poolAddress && isPumpFun && accounts[4]) {
				poolAddress = accounts[4];
			}
		}

		// Если это покупка - то мы ищем по адресу кошелька. Если это осталеживание по цене - мы ищем по адрес пула
		if (!walletAddress || !poolAddress || !this._buySubscribers[walletAddress]) {
			return;
		}

		const price = this._solanaPriceService.computeMemeTokenPrice(prices);
		const body: ISolanaTransaction = {
			price,
			walletAddress,
			poolAddress,
			date,
			authories,
			signature: message?.params?.result?.signature
		};

		this._loggerService.log(`Buy init ${body.poolAddress}`);
		this._buySubscribers[walletAddress].next(body);
	}

	on(account: string, type: SubscribtionTypeEnum) {
		const subject = new Subject<ISolanaTransaction>();

		this._loggerService.log(`On ${account} ${type}`);

		if (type === SubscribtionTypeEnum.BUY && !this._buySubscribers[account]) {
			this._buySubscribers[account] = subject;
			this._solanaConfig.provider.subscribe([account], CommitmentTypeEnum.PROCESSED);
		} else if (type === SubscribtionTypeEnum.PRICE && !this._priceSubscribers[account]) {
			this._priceSubscribers[account] = subject;
			this._solanaConfig.provider.subscribe([account], CommitmentTypeEnum.CONFIRMED);
		}

		return subject;
	}

	unsubscribe(accounts: string[]) {
		for (const account of accounts) {
			delete this._buySubscribers[account];
			delete this._priceSubscribers[account];
		}
	}

	async buy(pollAddress: string, price: number, secret: string) {
		try {
			return await this._swapService.buyToken(pollAddress, price, secret);
		} catch (error) {
			this._loggerService.error(error);
		}
	}

	async sell(pollAddress: string, secret: string) {
		try {
			return await this._swapService.sellToken(pollAddress, secret);
		} catch (error) {
			this._loggerService.error(error);
		}
	}

	getTransactions(pollAddress: string, signature?: string) {
		return this._solanaConfig.provider.getTransactions(pollAddress, signature);
	}
}
