import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";
import { first, interval, lastValueFrom, map, race } from "rxjs";

import { HELIUS_CONFIG } from "./injection-tokens/helius-config.injection-token";
import type { IHeliusConfig } from "./interfaces/helius-config.interface";
import { HELIUS_SERVICES } from "./services";

@Module({
	imports: [HttpModule],
	providers: HELIUS_SERVICES,
	exports: HELIUS_SERVICES
})
export class HeliusModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(heliusConfig: IHeliusConfig): DynamicModule {
		const dynamicModule = {
			module: HeliusModule,
			providers: [
				{
					provide: HELIUS_CONFIG,
					useValue: heliusConfig
				}
			]
		};

		HeliusModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, HeliusModule.moduleSubject.asObservable()).pipe(first()));
	}
}
