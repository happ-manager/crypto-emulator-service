import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LOGGER_CONFIG } from "./injection-tokens/logger-config.injection-token";
import type { ILoggerConfig } from "./interfaces/logger-config.interface";
import { LOGGER_SERVICES } from "./services";

@Module({
	providers: LOGGER_SERVICES,
	exports: LOGGER_SERVICES
})
export class LoggerModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(loggerConfig: ILoggerConfig): DynamicModule {
		const dynamicModule = {
			module: LoggerModule,
			providers: [
				{
					provide: LOGGER_CONFIG,
					useValue: loggerConfig
				}
			]
		};

		LoggerModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, LoggerModule.moduleSubject.asObservable()).pipe(first()));
	}
}
