import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { COIN_GECKO_CONFIG } from "./injection-tokens/coin-gecko-config.injection-token";
import type { ICoinGeckoConfig } from "./interfaces/coin-gecko-config.interface";
import { COIN_GECKO_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: COIN_GECKO_SERVICES,
	exports: COIN_GECKO_SERVICES
})
export class CoinGeckoModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(coinGeckoConfig: ICoinGeckoConfig): DynamicModule {
		const dynamicModule = {
			module: CoinGeckoModule,
			providers: [
				{
					provide: COIN_GECKO_CONFIG,
					useValue: coinGeckoConfig
				}
			]
		};

		CoinGeckoModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, CoinGeckoModule.moduleSubject.asObservable()).pipe(first()));
	}
}
