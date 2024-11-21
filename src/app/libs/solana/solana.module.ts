import { HttpModule } from "@nestjs/axios";
import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import { Connection } from "@solana/web3.js";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { EventsModule } from "../../events/events.module";
import { DateModule } from "../date";
import { LoggerModule } from "../logger";
import { CONFIRMED_CONNECTION } from "./injection-tokens/confirmed-connection.injection-token";
import { PROCESSED_CONNECTION } from "./injection-tokens/processed-connection.injection-token";
import { SOLANA_CONFIG } from "./injection-tokens/solana-config.injection-token";
import type { ISolanaConfig } from "./interfaces/solana-config.interface";
import { SOLANA_SERVICES } from "./services";

@Module({
	imports: [HttpModule, EventsModule, DateModule.forChild(), LoggerModule.forChild()],
	providers: SOLANA_SERVICES,
	exports: SOLANA_SERVICES
})
export class SolanaModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(solanaConfig: ISolanaConfig): DynamicModule {
		const confirmedConnection = new Connection(solanaConfig.heliusStakedRpcUrl, "confirmed");
		const processedConnection: Connection = new Connection(solanaConfig.heliusStakedRpcUrl, "processed");

		const dynamicModule = {
			module: SolanaModule,
			providers: [
				{
					provide: SOLANA_CONFIG,
					useValue: solanaConfig
				},
				{
					provide: CONFIRMED_CONNECTION,
					useValue: confirmedConnection
				},
				{
					provide: PROCESSED_CONNECTION,
					useValue: processedConnection
				}
			]
		};

		SolanaModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, SolanaModule.moduleSubject.asObservable()).pipe(first()));
	}
}
