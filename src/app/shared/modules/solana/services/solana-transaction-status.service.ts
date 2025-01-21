import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";

import { EventsEnum } from "../../../enums/events.enum";
import { HeliusService } from "../../helius/services/helius.service";

@Injectable()
export class SolanaTransactiosnStatusService {
	private readonly _loggerService = new Logger("SolanaTransactiosnStatusService");

	constructor(
		private readonly _heliusService: HeliusService,
		private readonly _eventsService: EventEmitter2
	) {}

	@OnEvent(EventsEnum.SOLANA_TRANSACTION)
	async onSendSolanaTransaction(signature: string) {
		try {
			const result = await this._heliusService.connection.getSignatureStatus(signature, {
				searchTransactionHistory: true
			});

			if (result || !result.value.err) {
				return;
			}

			this._eventsService.emit(EventsEnum.SOLANA_TRANSACTION_FAILED, signature, true);
		} catch (error) {
			this._loggerService.error(error, "onSendSolanaTransaction");
		}
	}
}
