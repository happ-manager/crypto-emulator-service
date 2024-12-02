import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { LoggerService } from "../../libs/logger";
import type { SubscribtionTypeEnum } from "../../libs/solana/enums/subscribtion-type.enum";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { ITradingToken } from "../../trading/interfaces/trading-token.interface";
import { EventsEnum } from "../enums/events.enum";

@Injectable()
export class EventsLoggerService {
	constructor(private readonly _loggerService: LoggerService) {}

	@OnEvent(EventsEnum.SOLANA_SUBSCRIBE)
	onSolanaSubscribe(body: { account: string; type: SubscribtionTypeEnum }) {
		if (!body) {
			return;
		}

		this._loggerService.log(`Начали следить за ${body.account}. Тип: ${body.type}`);
	}

	@OnEvent(EventsEnum.SOLANA_UNSUBSCRIBE)
	onSolanaUnsubscribe(body: { accounts: string[] }) {
		if (!body) {
			return;
		}

		this._loggerService.log(`Отписались от ${(body.accounts || []).join(", ")}`);
	}

	@OnEvent(EventsEnum.MILESTONE_CHECKED)
	onMilestoneChecked(body: { tradingToken: ITradingToken; milestone: IMilestone }) {
		if (!body) {
			return;
		}

		this._loggerService.log(`Начали ${body.milestone.name} ${body.tradingToken.poolAddress}`);
	}

	@OnEvent(EventsEnum.MILESTONE_CONFIRMED)
	onMilestoneConfirmed(body: { tradingToken: ITradingToken; milestone: IMilestone }) {
		this._loggerService.log(`Совершили ${body.milestone.name}  ${body.tradingToken.poolAddress}`);
	}
}
