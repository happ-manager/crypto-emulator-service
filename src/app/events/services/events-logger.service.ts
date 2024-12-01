import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { LoggerService } from "../../libs/logger";
import type { SubscribtionTypeEnum } from "../../libs/solana/enums/subscribtion-type.enum";
import { EventsEnum } from "../enums/events.enum";

@Injectable()
export class EventsLoggerService {
	constructor(private readonly _loggerService: LoggerService) {}

	@OnEvent(EventsEnum.SOLANA_SUBSCRIBE)
	onSolanaSubscribe(body: { account: string; type: SubscribtionTypeEnum }) {
		if (!body) {
			return;
		}

		this._loggerService.log(`Subscribe on ${body.account}. Type: ${body.type}`);
	}
}
