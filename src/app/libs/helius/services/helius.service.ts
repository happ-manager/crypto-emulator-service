import { HttpService } from "@nestjs/axios";
import type { OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Connection } from "@solana/web3.js";
import * as WebSocket from "ws";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { LoggerService } from "../../logger";
import type { ISolanaProvider } from "../../solana";
import { CommitmentTypeEnum } from "../../solana/enums/commitment-type.enum";
import type { IApiTransaction } from "../../solana/interfaces/api-transaction.interface";
import { HELIUS_CONFIG } from "../injection-tokens/helius-config.injection-token";
import { IHeliusConfig } from "../interfaces/helius-config.interface";

@Injectable()
export class HeliusService implements OnModuleInit, ISolanaProvider {
	private _ws: WebSocket;
	private _wsAccounts = {};

	readonly connection = new Connection(this._heliusConfig.stakedRpcUrl, "confirmed");

	reopen = true;

	constructor(
		@Inject(HELIUS_CONFIG) private readonly _heliusConfig: IHeliusConfig,
		private readonly _httpService: HttpService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	onModuleInit() {
		// setTimeout(this.init.bind(this));
	}

	init() {
		this._ws = new WebSocket(this._heliusConfig.enhancedWebsocketUrl);

		this._ws.on("open", () => {
			this._loggerService.log("WebSocket соединение установлено.");

			const accounts = Object.keys(this._wsAccounts);

			if (accounts.length > 0) {
				const proccees = accounts.filter((acc) => this._wsAccounts[acc] === CommitmentTypeEnum.PROCESSED);
				const confirmed = accounts.filter((acc) => this._wsAccounts[acc] === CommitmentTypeEnum.CONFIRMED);

				if (proccees.length > 0) {
					this.subscribe(proccees, CommitmentTypeEnum.PROCESSED);
				}

				if (confirmed.length > 0) {
					this.subscribe(confirmed, CommitmentTypeEnum.CONFIRMED);
				}
			}

			setInterval(() => {
				if (this._ws.readyState !== WebSocket.OPEN) {
					return;
				}

				this._ws.ping();
			}, 30_000);

			this._eventsService.emit(EventsEnum.HELIUS_OPEN);
		});
		this._ws.on("message", async (messageBuffer: WebSocket.Data) => {
			const message = JSON.parse(messageBuffer.toString());

			if (message.error || message.params?.error) {
				this.reopen = false;
				this._ws.close();
				return;
			}

			this._eventsService.emit(EventsEnum.HELIUS_MESSAGE, message);
		});
		this._ws.on("error", (error) => {
			this._loggerService.error("Ошибка WebSocket:", error.message);

			this._eventsService.emit(EventsEnum.HELIUS_ERROR, error);
		});
		this._ws.on("close", (err) => {
			this._loggerService.error("WebSocket соединение закрыто.", err.toString());

			this._eventsService.emit(EventsEnum.HELIUS_CLOSE);

			if (!this.reopen) {
				return;
			}

			setTimeout(this.init.bind(this), 2000);
		});
	}

	subscribe(accountInclude: string[], commitment: CommitmentTypeEnum) {
		if (!this._ws) {
			return;
		}

		this._wsAccounts = accountInclude.reduce((pre, cur) => ({ ...pre, [cur]: commitment }), this._wsAccounts);

		const subscription = {
			jsonrpc: "2.0",
			id: 420,
			method: "transactionSubscribe",
			params: [
				{
					accountInclude
				},
				{
					commitment,
					encoding: "jsonParsed",
					transactionDetails: "full",
					showRewards: false,
					maxSupportedTransactionVersion: 0
				}
			]
		};

		this._ws.send(JSON.stringify(subscription));
	}

	getTransactions(poolAddress: string, signature?: string) {
		const baseUrl = `https://api.helius.xyz/v0/addresses/${poolAddress}/transactions?api-key=${this._heliusConfig.apiKey}`;
		const query = signature ? `&before=${signature}` : "";

		return this._httpService.get<IApiTransaction[]>(baseUrl + query);
	}
}
