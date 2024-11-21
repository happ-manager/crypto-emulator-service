import type { OnModuleInit } from "@nestjs/common";
import { Inject, Injectable } from "@nestjs/common";

import { EventsEnum } from "../../../events/enums/events.enum";
import { EventsService } from "../../../events/services/events.service";
import { getTokenAddress } from "../../../shared/utils/get-token-address.util";
import { TelegramService } from "../../telegram";
import type { ITelegramResposne } from "../../telegram/interfaces/telegram-response.interface";
import { BUY_BUTTONS, SELL_BUTTONS } from "../constants/bot-buttons.constant";
import { BOT_MESSAGES } from "../constants/bot-messages.constant";
import { TROJAN_CONFIG } from "../injection-tokens/trojan-config.injection-token";
import { ITrojanConfig } from "../interfaces/trojan-config.interface";

@Injectable()
export class TrojanService implements OnModuleInit {
	private _addressesToBuy = [];

	constructor(
		@Inject(TROJAN_CONFIG) private readonly trojanConfig: ITrojanConfig,
		private readonly _telegramService: TelegramService,
		private readonly _eventsService: EventsService
	) {}

	onModuleInit() {
		setTimeout(async () => {
			await this._telegramService.subscribeToMessages(this.trojanConfig.botId, this.handleMessage.bind(this));
		}, 0);
	}

	async sellToken(tokenAddress: string): Promise<void> {
		await this._telegramService.sendMessageToBot(this.trojanConfig.botUsername, `/start sellToken-${tokenAddress}`);
	}

	async buyToken(tokenAddress: string): Promise<void> {
		await this._telegramService.sendMessageToBot(this.trojanConfig.botUsername, `/buy`);
		this._addressesToBuy.push(tokenAddress);
	}

	async handleAddress() {
		const tokenAddress = this._addressesToBuy.pop();

		if (!tokenAddress) {
			return;
		}

		await this._telegramService.sendMessageToBot(this.trojanConfig.botUsername, tokenAddress);
	}

	async handleBuy(response: ITelegramResposne) {
		const { id } = response;

		if (!id) {
			return;
		}

		await this._telegramService.clickInlineButton(this.trojanConfig.botUsername, id, BUY_BUTTONS.FIRST_PRICE);

		setTimeout(async () => {
			const message = await this._telegramService.getMessageById(id);

			this._eventsService.emit(EventsEnum.TOKEN_BOUGHT, message);
		}, 5000);
	}

	async handleSell(response: ITelegramResposne) {
		const { id, message } = response;
		const tokenAddress = getTokenAddress(message);

		if (!id || !tokenAddress) {
			return;
		}

		await this._telegramService.clickInlineButton(this.trojanConfig.botUsername, id, SELL_BUTTONS.FIRST_PRICE);

		setTimeout(async () => {
			const message = await this._telegramService.getMessageById(id);

			this._eventsService.emit(EventsEnum.TOKEN_SELLED, message);
		}, 5000);
	}

	async handleMessage(response: ITelegramResposne) {
		const { message } = response;
		const { ENTER_ADDRESS, BUY, SELL } = BOT_MESSAGES;

		if (message.includes(ENTER_ADDRESS)) {
			await this.handleAddress();
		} else if (message.includes(BUY)) {
			await this.handleBuy(response);
		} else if (message.includes(SELL)) {
			await this.handleSell(response);
		}
	}
}
