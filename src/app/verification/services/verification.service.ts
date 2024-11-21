import type { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { TelegramService } from "../../libs/telegram";
import { getTokenAddress } from "../../shared/utils/get-token-address.util";
import { checkBlackList } from "../utils/check-black-list.util";

@Injectable()
export class VerificationService implements OnModuleInit {
	private readonly botUsername = "@PirbViewBot";
	private readonly botId = 6_362_041_475n;

	constructor(
		private readonly _telegramService: TelegramService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	onModuleInit() {
		setTimeout(async () => {
			await this._telegramService.subscribeToMessages(this.botId, this.handleMessage.bind(this));
		}, 0);
	}

	async check(tokenAddress: string): Promise<void> {
		const message = `/s ${tokenAddress}`;

		try {
			await this._telegramService.sendMessageToBot(this.botUsername, message);
		} catch (error) {
			this._loggerService.error("Verification failed:", error);
		}
	}

	async handleMessage(response: any) {
		const blackList = [
			"🚨 Proxy",
			"🚨 Tax modifiable",
			"🚨 MINT",
			"🚨 Antiwhale",
			"🚨 LIQUIDITY UNLOCKED",
			"There has been an issue with this address, please make sure it's an active token address."
		];

		const tokenAddress = getTokenAddress(response.message);

		if (!tokenAddress) {
			this._loggerService.error(`Не получается найти адрес токена ${response.message}`);
			return;
		}

		const isTextValid = checkBlackList(response.message, blackList);

		if (!isTextValid) {
			this._loggerService.error(`Токен ${tokenAddress} не прошел проверку в пирбе. ${response.message}`);
			return;
		}

		this._eventsService.emit(EventsEnum.TOKEN_VERIFIED, response.message);
	}
}
