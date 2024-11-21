import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { DateModule } from "../date";
import { LoggerModule } from "../logger";
import { SOLSCAN_CONFIG } from "./injection-tokens/solscan-config.injection-token";
import type { ISolscanConfig } from "./interfaces/solscan-config.interface";
import { SOLSCAN_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild(), DateModule.forChild()],
	providers: SOLSCAN_SERVICES,
	exports: SOLSCAN_SERVICES
})
export class SolscanModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(solscanConfig: ISolscanConfig): DynamicModule {
		const dynamicModule = {
			module: SolscanModule,
			providers: [
				{
					provide: SOLSCAN_CONFIG,
					useValue: solscanConfig
				}
			]
		};

		SolscanModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, SolscanModule.moduleSubject.asObservable()).pipe(first()));
	}
}
