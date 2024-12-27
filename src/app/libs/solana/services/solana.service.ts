import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

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
}
