import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { MESSARI_CONFIG } from "./injection-tokens/messari-config.injection-token";
import type { IMessariConfig } from "./interfaces/messari-config.interface";
import { MESSARI_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: MESSARI_SERVICES,
	exports: MESSARI_SERVICES
})
export class MessariModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(messariConfig: IMessariConfig): DynamicModule {
		const dynamicModule = {
			module: MessariModule,
			providers: [
				{
					provide: MESSARI_CONFIG,
					useValue: messariConfig
				}
			]
		};

		MessariModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, MessariModule.moduleSubject.asObservable()).pipe(first()));
	}
}
