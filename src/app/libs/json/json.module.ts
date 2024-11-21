import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { JSON_CONFIG } from "./injection-tokens/json-config.injection-token";
import type { IJsonConfig } from "./interfaces/json.interface";
import { JSON_SERVICES } from "./services";

@Module({
	providers: JSON_SERVICES,
	exports: JSON_SERVICES
})
export class JsonModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(jsonConfig: IJsonConfig): DynamicModule {
		const dynamicModule = {
			module: JsonModule,
			providers: [
				{
					provide: JSON_CONFIG,
					useValue: jsonConfig
				}
			]
		};

		JsonModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, JsonModule.moduleSubject.asObservable()).pipe(first()));
	}
}
