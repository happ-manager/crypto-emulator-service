import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { HeliusService } from "../../helius/services/helius.service";
import { LoggerService } from "../../logger";

@Injectable()
export class SolanaTransactiosnStatusService {
	constructor(
		private readonly _heliusService: HeliusService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.SEND_SOLANA_TRANSACTION)
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
