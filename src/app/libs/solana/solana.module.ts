import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { EventsModule } from "../../events/events.module";
import type { AsyncModuleOptions } from "../../shared/interfaces/async-module-options.interface";
import { DateModule } from "../date";
import { FilesModule } from "../files";
import { LoggerModule } from "../logger";
import { SOLANA_CONFIG } from "./injection-tokens/solana-config.injection-token";
import type { ISolanaConfig } from "./interfaces/solana-config.interface";
import { SOLANA_SERVICES } from "./services";

@Module({
	imports: [
		HttpModule,
		EventsModule.forChild(),
		DateModule.forChild(),
		LoggerModule.forChild(),
		FilesModule.forChild()
	],
	providers: SOLANA_SERVICES,
	exports: SOLANA_SERVICES
})
export class SolanaModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(solanaConfig: ISolanaConfig): DynamicModule {
		const dynamicModule = {
			module: SolanaModule,
			providers: [
				{
					provide: SOLANA_CONFIG,
					useValue: solanaConfig
				}
			]
		};

		SolanaModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static forRootAsync(options: AsyncModuleOptions<ISolanaConfig>): DynamicModule {
		const dynamicModule = {
			module: SolanaModule,
			imports: options.imports?.length ? options.imports : [],
			providers: [
				{
					provide: SOLANA_CONFIG,
					useFactory: async (...args: any[]) => options.useFactory(...args),
					inject: options.inject?.length ? options.inject : []
				}
			]
		};

		SolanaModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, SolanaModule.moduleSubject.asObservable()).pipe(first()));
	}
}
