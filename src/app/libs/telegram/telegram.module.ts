import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

import { LoggerModule } from "../logger";
import { TELEGRAM_CLIENT } from "./injection-tokens/telegram-client.injection-token";
import { TELEGRAM_CONFIG } from "./injection-tokens/telegram-config.injection-token";
import type { ITelegramConfig } from "./interfaces/telegram-config.interface";
import { TELEGRAM_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: TELEGRAM_SERVICES,
	exports: TELEGRAM_SERVICES
})
export class TelegramModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(telegramConfig: ITelegramConfig): DynamicModule {
		const { stringSession, apiHash, apiId } = telegramConfig;

		const telegramClient = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
			connectionRetries: 5
		});

		const dynamicModule = {
			module: TelegramModule,
			providers: [
				{
					provide: TELEGRAM_CLIENT,
					useValue: telegramClient
				},
				{
					provide: TELEGRAM_CONFIG,
					useValue: telegramConfig
				}
			]
		};

		TelegramModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, TelegramModule.moduleSubject.asObservable()).pipe(first()));
	}
}
