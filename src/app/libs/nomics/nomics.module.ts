import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { NOMICS_CONFIG } from "./injection-tokens/nomics-config.injection-token";
import type { INomicsConfig } from "./interfaces/nomics-config.interface";
import { NOMICS_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: NOMICS_SERVICES,
	exports: NOMICS_SERVICES
})
export class NomicsModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(nomicsConfig: INomicsConfig): DynamicModule {
		const dynamicModule = {
			module: NomicsModule,
			providers: [
				{
					provide: NOMICS_CONFIG,
					useValue: nomicsConfig
				}
			]
		};

		NomicsModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, NomicsModule.moduleSubject.asObservable()).pipe(first()));
	}
}
