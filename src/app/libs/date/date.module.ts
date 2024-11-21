import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { DATE_CONFIG } from "./injection-tokens/date-config.injection-token";
import type { IDateConfig } from "./interfaces/date-config.interface";
import { DATE_SCALARS } from "./scalars";
import { DATE_SERVICES } from "./services";

@Module({
	providers: [...DATE_SERVICES, ...DATE_SCALARS],
	exports: [...DATE_SERVICES, ...DATE_SCALARS]
})
export class DateModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(dateConfig: IDateConfig): DynamicModule {
		const dynamicModule = {
			module: DateModule,
			providers: [
				{
					provide: DATE_CONFIG,
					useValue: dateConfig
				}
			]
		};

		DateModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, DateModule.moduleSubject.asObservable()).pipe(first()));
	}
}
