import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { HeliusService } from "../../helius/services/helius.service";
import { RaydiumService } from "../../raydium/services/raydium.service";
import type { CommitmentTypeEnum } from "../enums/commitment-type.enum";
import type { IDexSwap, IDexWrap } from "../interfaces/dex.interface";
import { ISolanaMessage } from "../interfaces/solana-message.interface";
import { SolanaBlockhashService } from "./solana-blockhash.service";

@Injectable()
export class SolanaService {
	constructor(
		private readonly _solanaBlockhashService: SolanaBlockhashService,
		private readonly _eventsService: EventsService,
		private readonly _raydiumService: RaydiumService,
		private readonly _heliusService: HeliusService
	) {}

	@OnEvent(EventsEnum.HELIUS_MESSAGE)
	handleHeliusMessage(message: ISolanaMessage) {
		if (!message?.params?.result?.transaction || message.params.result.transaction.meta.err) {
			return;
		}

		this._eventsService.emit(EventsEnum.SOLANA_MESSAGE, message);
	}

	subscribeTransactions(accountInclude: string[], accountExclude: string[], commitmentType?: CommitmentTypeEnum) {
		this._heliusService.subscribeTransactions(accountInclude, accountExclude, commitmentType);

		this._eventsService.emit(EventsEnum.SOLANA_SEND, { accountInclude, accountExclude, commitmentType }, true);
	}

	swap(dexSwap: Omit<IDexSwap, "rpc" | "blockhash">) {
		return this._raydiumService.swap({
			...dexSwap,
			rpc: this._heliusService,
			blockhash: this._solanaBlockhashService.blockhash
		});
	}

	wrap(dexWrap: Omit<IDexWrap, "rpc">) {
		return this._raydiumService.wrap({
			...dexWrap,
			rpc: this._heliusService
		});
	}

	unwrap(dexWrap: Omit<IDexWrap, "rpc">) {
		return this._raydiumService.unwrap({
			...dexWrap,
			rpc: this._heliusService
		});
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
}
