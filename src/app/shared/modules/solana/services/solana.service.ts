import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
	createAssociatedTokenAccountIdempotentInstruction,
	getAssociatedTokenAddressSync,
	TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import type { Keypair, SendOptions } from "@solana/web3.js";
import { ComputeBudgetProgram, TransactionInstruction } from "@solana/web3.js";
import { TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { EventsEnum } from "../../../enums/events.enum";
import { IPool } from "../../../interfaces/pool.interface";
import { HeliusService } from "../../helius/services/helius.service";
import { SEND_OPTIONS } from "../constant/send-options.constant";
import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import type { IComputeUnits } from "../interfaces/compute-units.interface";
import { encodeData } from "../utils/encode-data.util";
import { SolanaBlockhashService } from "./solana-blockhash.service";
import { SolanaPriceService } from "./solana-price.service";

@Injectable()
export class SolanaService {
	private readonly _loggerService = new Logger("SolanaService");
	constructor(
		private readonly _solanaBlockhashService: SolanaBlockhashService,
		private readonly _solanaPriceService: SolanaPriceService,
		private readonly _heliusService: HeliusService,
		private readonly _eventsService: EventEmitter2
	) {}

	async init() {
		this._loggerService.log("Solana is running");

		await this._solanaPriceService.startPriceCheck(5000);
		await this._solanaBlockhashService.startBlockhashCheck(60_000);
	}

	subscribeTransactions(accountInclude: string[], accountExclude: string[], commitmentType?: CommitmentTypeEnum) {
		this._heliusService.subscribeTransactions(accountInclude, accountExclude, commitmentType);
	}

	async swap(
		from: PublicKey,
		to: PublicKey,
		amount: number,
		signer: Keypair,
		pool: IPool,
		computeUnits: IComputeUnits,
		sendOptions: SendOptions = SEND_OPTIONS
	) {
		const { microLamports, units } = computeUnits;
		const tokenInAccount = getAssociatedTokenAddressSync(from, signer.publicKey);
		const tokenOutAccount = getAssociatedTokenAddressSync(to, signer.publicKey);

		const instructions: TransactionInstruction[] = [
			ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
			ComputeBudgetProgram.setComputeUnitLimit({ units }),
			createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, tokenInAccount, signer.publicKey, from),
			createAssociatedTokenAccountIdempotentInstruction(signer.publicKey, tokenOutAccount, signer.publicKey, to),
			new TransactionInstruction({
				programId: new PublicKey(pool.programId),
				data: encodeData(from, amount),
				keys: [
					// system
					{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
					// amm
					{ pubkey: new PublicKey(pool.address), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.authority), isSigner: false, isWritable: false },
					{ pubkey: new PublicKey(pool.openOrders), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.targetOrders), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.baseVault), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.quoteVault), isSigner: false, isWritable: true },
					// serum
					{ pubkey: new PublicKey(pool.marketProgramId), isSigner: false, isWritable: false },
					{ pubkey: new PublicKey(pool.marketId), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketBids), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketAsks), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketEventQueue), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketBaseVault), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketQuoteVault), isSigner: false, isWritable: true },
					{ pubkey: new PublicKey(pool.marketAuthority), isSigner: false, isWritable: false },
					// user
					{ pubkey: tokenInAccount, isSigner: false, isWritable: true },
					{ pubkey: tokenOutAccount, isSigner: false, isWritable: true },
					{ pubkey: signer.publicKey, isSigner: true, isWritable: false }
				]
			})
		];

		return this.sendRawTransaction(instructions, signer, sendOptions);
	}

	async sendRawTransaction(instructions: TransactionInstruction[], signer: Keypair, sendOptions: SendOptions) {
		const transactionMessage = new TransactionMessage({
			instructions,
			payerKey: signer.publicKey,
			recentBlockhash: this._solanaBlockhashService.blockhash
		});
		const transaction = new VersionedTransaction(transactionMessage.compileToV0Message());

		transaction.sign([signer]);

		const signature = await this._heliusService.connection.sendRawTransaction(transaction.serialize(), sendOptions);

		this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION, signature);

		return signature;
	}

	async getAmount(walletAddress: string, mintAddress: string): Promise<number> {
		try {
			const walletPubKey = new PublicKey(walletAddress);
			const mintPubKey = new PublicKey(mintAddress);

			const tokenAccount = getAssociatedTokenAddressSync(mintPubKey, walletPubKey);

			const accountInfo = await this._heliusService.connection.getParsedAccountInfo(tokenAccount);

			if (!accountInfo.value) {
				return 0;
			}

			return accountInfo.value.data["parsed"].info.tokenAmount.uiAmount;
		} catch (error) {
			throw new Error(`Не удалось получить баланс токенов: ${error.message}`);
		}
	}

	async getAsset(mintAddress: string) {
		return this._heliusService.getAsset(mintAddress);
	}
}
