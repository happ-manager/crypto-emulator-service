import type { OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { Connection } from "@solana/web3.js";
import { Helius } from "helius-sdk";
import * as WebSocket from "ws";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { LoggerService } from "../../logger";
import type { CommitmentTypeEnum } from "../../solana/enums/commitment-type.enum";
import type { IRpc } from "../../solana/interfaces/rpc.interface";
import type { ISolanaMessage } from "../../solana/interfaces/solana-message.interface";
import { HELIUS_CONFIG } from "../injection-tokens/helius-config.injection-token";
import { IHeliusConfig } from "../interfaces/helius-config.interface";
import { HeliusApiService } from "./helius-api.service";

@Injectable()
export class HeliusService implements OnModuleInit, IRpc {
	private _ws: WebSocket;

	readonly connection = new Connection(this._heliusConfig.stakedRpcUrl, "confirmed");
	readonly helius = new Helius(this._heliusConfig.apiKey);

	readonly accounts: Record<string, CommitmentTypeEnum> = {};

	constructor(
		@Inject(HELIUS_CONFIG) private readonly _heliusConfig: IHeliusConfig,
		private readonly _heliusApiService: HeliusApiService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	onModuleInit() {
		setTimeout(this.init.bind(this));
	}

	init() {
		this._ws = new WebSocket(this._heliusConfig.enhancedWebsocketUrl);

		this._ws.on("open", () => {
			this._loggerService.log("Helius соединение установлено.", "HeliusService");

			setInterval(() => {
				if (this._ws.readyState !== WebSocket.OPEN) {
					return;
				}

				this._ws.ping();
			}, 30_000);

			this._eventsService.emit(EventsEnum.HELIUS_OPEN, null, true);

			for (const [account, commitment] of Object.entries(this.accounts)) {
				this.subscribeTransactions([account], [], commitment);
			}
		});
		this._ws.on("message", async (messageBuffer: WebSocket.Data) => {
			const message: ISolanaMessage = JSON.parse(messageBuffer.toString());

			if (message.error || message.params?.error) {
				this._loggerService.error(message.error || message.params?.error, "init");

				this._ws.close();
				return;
			}

			this._eventsService.emit(EventsEnum.SOLANA_MESSAGE, message);
		});
		this._ws.on("error", (error) => {
			this._loggerService.error(`Helius ошибка: ${error.message}`, "HeliusService");

			this._eventsService.emit(EventsEnum.HELIUS_ERROR, error.message, true);
		});
		this._ws.on("close", (errorCode) => {
			this._loggerService.error(`Helius соединение закрыто: ${errorCode}`, "HeliusService");

			this._eventsService.emit(EventsEnum.HELIUS_CLOSE, errorCode, true);

			this.init();
		});
	}

	subscribeTransactions(accountInclude: string[], accountExclude: string[], commitment?: CommitmentTypeEnum) {
		if (!this._ws) {
			return;
		}

		const subscription = {
			jsonrpc: "2.0",
			id: 420,
			method: "transactionSubscribe",
			params: [
				{
					accountInclude,
					accountExclude
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

		for (const account of accountInclude) {
			console.log(`Subscribe on ${account}`);
			this.accounts[account] = commitment;
		}

		for (const account of accountExclude) {
			console.log(`Unsubscribe from ${account}`);
			delete this.accounts[account];
		}
	}

	getAsset(mintAddress: string) {
		return this._heliusApiService.getAsset(mintAddress);
	}
}
