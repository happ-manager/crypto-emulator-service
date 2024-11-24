import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { DateModule } from "../date";
import { LoggerModule } from "../logger";
import { DEX_TOOLS_CONFIG } from "./injection-tokens/dex-tools-config.injection-token";
import type { IDexToolsConfig } from "./interfaces/dex-tools-config.interface";
import { DEX_TOOLS_SERVICES } from "./services";

@Module({
	imports: [DateModule.forChild(), LoggerModule.forChild(), HttpModule],
	providers: DEX_TOOLS_SERVICES,
	exports: DEX_TOOLS_SERVICES
})
export class DexToolsModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(dexToolsConfig: IDexToolsConfig): DynamicModule {
		const dynamicModule = {
			module: DexToolsModule,
			providers: [
				{
					provide: DEX_TOOLS_CONFIG,
					useValue: dexToolsConfig
				}
			]
		};

		DexToolsModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, DexToolsModule.moduleSubject.asObservable()).pipe(first()));
	}
}
