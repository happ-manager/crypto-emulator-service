import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { CRYPTO_COMPARE_CONFIG } from "./injection-tokens/crypto-compare-config.injection-token";
import type { ICryptoCompareConfig } from "./interfaces/crypto-compare-config.interface";
import { CRYPTO_COMPARE_SERVICES } from "./services";

@Module({
	imports: [HttpModule, LoggerModule.forChild()],
	providers: CRYPTO_COMPARE_SERVICES,
	exports: CRYPTO_COMPARE_SERVICES
})
export class CryptoCompareModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(cryptoCompareConfig: ICryptoCompareConfig): DynamicModule {
		const dynamicModule = {
			module: CryptoCompareModule,
			providers: [
				{
					provide: CRYPTO_COMPARE_CONFIG,
					useValue: cryptoCompareConfig
				}
			]
		};

		CryptoCompareModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, CryptoCompareModule.moduleSubject.asObservable()).pipe(first()));
	}
}
