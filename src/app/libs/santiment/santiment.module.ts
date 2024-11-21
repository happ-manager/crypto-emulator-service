import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { SANTIMENT_CONFIG } from "./injection-tokens/santiment-config.injection-token";
import type { ISantimentConfig } from "./interfaces/santiment-config.interface";
import { SANTIMENT_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: SANTIMENT_SERVICES,
	exports: SANTIMENT_SERVICES
})
export class SantimentModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(santimentConfig: ISantimentConfig): DynamicModule {
		const dynamicModule = {
			module: SantimentModule,
			providers: [
				{
					provide: SANTIMENT_CONFIG,
					useValue: santimentConfig
				}
			]
		};

		SantimentModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, SantimentModule.moduleSubject.asObservable()).pipe(first()));
	}
}
