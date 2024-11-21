import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { COIN_MARKET_CAP_CONFIG } from "./injection-tokens/coin-market-cap-config.injection-token";
import type { ICoinMarketCapConfig } from "./interfaces/coin-market-cap-config.interface";
import { COIN_MARKET_CAP_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: COIN_MARKET_CAP_SERVICES,
	exports: COIN_MARKET_CAP_SERVICES
})
export class CoinMarketCapModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(coinMarketCapConfig: ICoinMarketCapConfig): DynamicModule {
		const dynamicModule = {
			module: CoinMarketCapModule,
			providers: [
				{
					provide: COIN_MARKET_CAP_CONFIG,
					useValue: coinMarketCapConfig
				}
			]
		};

		CoinMarketCapModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, CoinMarketCapModule.moduleSubject.asObservable()).pipe(first()));
	}
}
