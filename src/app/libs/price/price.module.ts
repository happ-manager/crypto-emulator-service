import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { PRICE_CONFIG } from "./injection-tokens/price-config.injection-token";
import type { IPriceConfig } from "./interfaces/price-config.interface";
import { PRICE_SCALARS } from "./scalars";
import { PRICE_SERVICES } from "./services";

@Module({
	providers: [...PRICE_SERVICES, ...PRICE_SCALARS],
	exports: [...PRICE_SERVICES, ...PRICE_SCALARS]
})
export class PriceModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(priceConfig: IPriceConfig): DynamicModule {
		const dynamicModule = {
			module: PriceModule,
			providers: [
				{
					provide: PRICE_CONFIG,
					useValue: priceConfig
				}
			]
		};

		PriceModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, PriceModule.moduleSubject.asObservable()).pipe(first()));
	}
}
