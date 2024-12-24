import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { EventsModule } from "../../events/events.module";
import { TROJAN_CONFIG } from "./injection-tokens/trojan-config.injection-token";
import type { ITrojanConfig } from "./interfaces/trojan-config.interface";
import { TROJAN_SERVICES } from "./services";

@Module({
	imports: [HttpModule, EventsModule.forChild()],
	providers: TROJAN_SERVICES,
	exports: TROJAN_SERVICES
})
export class TrojanModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(trojanConfig: ITrojanConfig): DynamicModule {
		const dynamicModule = {
			module: TrojanModule,
			providers: [
				{
					provide: TROJAN_CONFIG,
					useValue: trojanConfig
				}
			]
		};

		TrojanModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, TrojanModule.moduleSubject.asObservable()).pipe(first()));
	}
}
