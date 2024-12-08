import { HttpService } from "@nestjs/axios";
import type { OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import {
	createAssociatedTokenAccountInstruction,
	createSyncNativeInstruction,
	getAssociatedTokenAddress
} from "@solana/spl-token";
import type { TransactionInstruction } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { Helius } from "helius-sdk";
import * as WebSocket from "ws";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { LoggerService } from "../../logger";
import type { ISolanaProvider } from "../../solana";
import type { CommitmentTypeEnum } from "../../solana/enums/commitment-type.enum";
import type { IApiTransaction } from "../../solana/interfaces/api-transaction.interface";
import { HELIUS_CONFIG } from "../injection-tokens/helius-config.injection-token";
import { IHeliusConfig } from "../interfaces/helius-config.interface";

const WRAPPED_SOLANA = "So11111111111111111111111111111111111111112";
const TOKEN_MINT = "EQRWgCWEwXD2QADZNE9nviKRqDeK3GnibLTnTdq8H2SA";
const POOL_ADDRESS = "6DrWmJAVcCLUTHzgdMoKroZCwdcS8sodLgctiBqvyys6";

@Injectable()
export class HeliusService implements OnModuleInit, ISolanaProvider {
	private _ws: WebSocket;

	readonly connection = new Connection(this._heliusConfig.stakedRpcUrl, "confirmed");
	readonly helius = new Helius(this._heliusConfig.apiKey);

	constructor(
		@Inject(HELIUS_CONFIG) private readonly _heliusConfig: IHeliusConfig,
		private readonly _httpService: HttpService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	onModuleInit() {
		setTimeout(this.init.bind(this));
		// const tokenMint = TOKEN_MINT;
		// const poolAddress = POOL_ADDRESS;
		// const wallet = Uint8Array.from('MY_WALLET_SECRET');
		// const amount = 0.001;
		//
		// setTimeout(async () => {
		// 	await this.buy(wallet, poolAddress, tokenMint, amount);
		// }, 5000);
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

			this._eventsService.emit(EventsEnum.SOLANA_PROVIDER_OPEN);
		});
		this._ws.on("message", async (messageBuffer: WebSocket.Data) => {
			const message = JSON.parse(messageBuffer.toString());

			if (message.error || message.params?.error) {
				this._ws.close();
				return;
			}

			this._eventsService.emit(EventsEnum.SOLANA_PROVIDER_MESSAGE, message);
		});
		this._ws.on("error", (error) => {
			this._loggerService.error("Ошибка WebSocket:", error.message);

			this._eventsService.emit(EventsEnum.SOLANA_PROVIDER_ERROR, error);
		});
		this._ws.on("close", (err) => {
			this._loggerService.error(err.toString(), "WebSocket соединение закрыто");

			this._eventsService.emit(EventsEnum.SOLANA_PROVIDER_CLOSE);

			setTimeout(this.init.bind(this), 2000);
		});
	}

	send(accountInclude: string[], accountExclude: string[], commitment?: CommitmentTypeEnum) {
		if (!this._ws) {
			return;
		}

		console.log({ accountInclude, accountExclude, commitment });

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
	}

	getTransactions(poolAddress: string, signature?: string) {
		const baseUrl = `https://api.helius.xyz/v0/addresses/${poolAddress}/transactions?api-key=${this._heliusConfig.apiKey}`;
		const query = signature ? `&before=${signature}` : "";

		return this._httpService.get<IApiTransaction[]>(baseUrl + query);
	}

	async buy(wallet: Uint8Array, poolAddress: string, tokenMint: string, amountInSol: number) {
		if (amountInSol <= 0) {
			throw new Error("Amount must be greater than 0.");
		}

		try {
			// Создаем Keypair из секретного ключа
			const walletKeypair = Keypair.fromSecretKey(wallet);
			const payer = walletKeypair.publicKey;

			// Пул и токен mint
			const poolPubKey = new PublicKey(poolAddress);
			const tokenMintPubKey = new PublicKey(tokenMint);

			// WSOL mint
			const wsolMint = new PublicKey(WRAPPED_SOLANA);
			const wsolAssociatedTokenAccount = await getAssociatedTokenAddress(wsolMint, payer);

			// Адрес токен-аккаунта для токена
			const targetTokenAccount = await getAssociatedTokenAddress(tokenMintPubKey, payer);

			// Инструкции для создания WSOL-аккаунта и обертывания SOL
			const instructions: TransactionInstruction[] = [
				// Создаем WSOL-аккаунт
				createAssociatedTokenAccountInstruction(payer, wsolAssociatedTokenAccount, payer, wsolMint),

				// Конвертация SOL в WSOL
				SystemProgram.transfer({
					fromPubkey: payer,
					toPubkey: wsolAssociatedTokenAccount,
					lamports: amountInSol * 1e9 // Конвертация SOL в лампорты
				}),

				// Синхронизация WSOL
				createSyncNativeInstruction(wsolAssociatedTokenAccount),

				// Создаем токен-аккаунт для BABYCRY
				createAssociatedTokenAccountInstruction(payer, targetTokenAccount, payer, tokenMintPubKey),

				// Своп WSOL → BABYCRY через пул
				SystemProgram.transfer({
					fromPubkey: wsolAssociatedTokenAccount,
					toPubkey: poolPubKey,
					lamports: amountInSol * 1e9 // Передача WSOL в пул
				})
			];

			// Используем Helius CDK для отправки транзакции
			const transactionSignature = await this.helius.rpc.sendSmartTransaction(
				instructions,
				[walletKeypair], // Передаем ключи для подписания транзакции
				[], // Lookup tables, если они необходимы
				{ skipPreflight: true } // Пропускаем preflight-проверку
			);

			console.log(`Успешный своп! TX ID: ${transactionSignature}`);
			return transactionSignature;
		} catch (error) {
			console.error("Ошибка при покупке токенов:", error.message);
			throw error;
		}
	}

	async sell(from: string, to: Uint8Array, amount: number) {
		if (amount <= 0) {
			throw new Error("Amount must be greater than 0.");
		}

		try {
			const fromPubKey = new PublicKey(from);
			const toPubKey = Keypair.fromSecretKey(to);

			// Формирование инструкции для продажи
			const instructions: TransactionInstruction[] = [
				SystemProgram.transfer({
					fromPubkey: fromPubKey, // Пул
					toPubkey: toPubKey.publicKey, // Ваш кошелек
					lamports: amount * 1e9 // Конвертация SOL в лампорты
				})
			];

			// Создание и отправка транзакции
			const transactionSignature = await this.helius.rpc.sendSmartTransaction(
				instructions,
				[toPubKey], // Подписывающие ключи
				[],
				{ skipPreflight: true }
			);

			this._loggerService.log(`Успешная продажа. TX ID: ${transactionSignature}`);
			return transactionSignature;
		} catch (error) {
			this._loggerService.error("Ошибка при продаже токенов:", error.message);
			throw error;
		}
	}
}
