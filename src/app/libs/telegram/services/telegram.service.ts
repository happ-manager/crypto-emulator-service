import * as readline from "node:readline";

import type { OnModuleInit } from "@nestjs/common";
import { Inject, Injectable } from "@nestjs/common";
import { Api, TelegramClient } from "telegram";
import { NewMessage } from "telegram/events";

import { LoggerService } from "../../logger";
import { TELEGRAM_CLIENT } from "../injection-tokens/telegram-client.injection-token";
import { TELEGRAM_CONFIG } from "../injection-tokens/telegram-config.injection-token";
import { ITelegramConfig } from "../interfaces/telegram-config.interface";
import type { ITelegramResposne } from "../interfaces/telegram-response.interface";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

@Injectable()
export class TelegramService implements OnModuleInit {
	constructor(
		@Inject(TELEGRAM_CONFIG) private readonly _telegramConfig: ITelegramConfig,
		@Inject(TELEGRAM_CLIENT) private readonly _telegramClient: TelegramClient,
		private readonly _loggerService: LoggerService
	) {}

	// Подключение к Telegram
	async onModuleInit() {
		if (this._telegramConfig.disabled) {
			return;
		}

		await this._telegramClient.start({
			phoneNumber: async () => new Promise((resolve) => rl.question("Please enter your number: ", resolve)),
			password: async () => new Promise((resolve) => rl.question("Please enter your password: ", resolve)),
			phoneCode: async () => new Promise((resolve) => rl.question("Please enter the code you received: ", resolve)),
			onError: (err) => this._loggerService.error(err.message)
		});
		this._loggerService.log(this._telegramClient.session.save() as any as string); // Save this string to avoid logging in again
	}

	async getMessageById(id: number) {
		const result: any = await this._telegramClient.invoke(
			new Api.messages.GetMessages({
				id: [new Api.InputMessageID({ id })]
			})
		);

		if (result.messages.length === 0) {
			return;
		}

		return result.messages[0].message;
	}

	// Метод для подписки на сообщения от бота
	async subscribeToMessages(botUserId: bigint, callback: (telegramResponse: ITelegramResposne) => void) {
		// Добавляем обработчик событий для новых сообщений
		this._telegramClient.addEventHandler((event: any) => {
			const { message } = event;

			if (message?.peerId?.userId?.value === botUserId) {
				callback(message);
			}
		}, new NewMessage({}));
	}

	// Отправляем сообщение боту без закрытия соединения
	async sendMessageToBot(botUsername: string, message: string) {
		try {
			return await this._telegramClient.sendMessage(botUsername, {
				message
			});
		} catch (error) {
			this._loggerService.error("Error while sending message to bot:", error);
		}
	}

	// Метод для нажатия на инлайн-кнопку
	async clickInlineButton(chatId: string, messageId: number, position: number[]) {
		try {
			const result = await this._telegramClient.getMessages(chatId, { ids: messageId });

			if (result.length === 0) {
				this._loggerService.error("Message not found.");
				return;
			}

			const [message] = result;

			// Проверяем наличие инлайн-кнопок
			if (!message.replyMarkup || !(message.replyMarkup instanceof Api.ReplyInlineMarkup)) {
				this._loggerService.error("No inline buttons found.");
				return;
			}

			const [rowIndex, columnIndex] = position;

			// Проверяем, существует ли указанный ряд
			const row = message.replyMarkup.rows[rowIndex];
			if (!row) {
				this._loggerService.error("Row not found.");
				return;
			}

			// Проверяем, существует ли кнопка в этом ряду
			const inlineButton = row.buttons[columnIndex];
			if (!inlineButton) {
				this._loggerService.error("Button not found.");
				return;
			}

			// Отправляем запрос на нажатие кнопки
			return await this._telegramClient.invoke(
				new Api.messages.GetBotCallbackAnswer({
					peer: chatId,
					msgId: messageId,
					data: (inlineButton as any).data
				})
			);
		} catch (error) {
			this._loggerService.error("Error clicking inline button:", error);
		}
	}
}
