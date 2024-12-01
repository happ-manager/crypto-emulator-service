import { type DynamicModule, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { first, interval, lastValueFrom, map, type Observable, race, Subject } from "rxjs";

import { LoggerModule } from "../libs/logger";
import { EVENTS_CONTROLLERS } from "./controllers";
import { EVENTS_GATEWAYS } from "./gateways";
import type { IEventsConfig } from "./interfaces/event-config.interface";
import { EVENTS_SERVICES } from "./services";

@Module({
	imports: [DiscoveryModule, EventEmitterModule, LoggerModule.forChild()],
	controllers: EVENTS_CONTROLLERS,
	providers: [...EVENTS_GATEWAYS, ...EVENTS_SERVICES],
	exports: EVENTS_SERVICES
})
export class EventsModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(eventsConfig?: IEventsConfig): DynamicModule {
		const dynamicModule = {
			module: EventsModule,
			providers: EventEmitterModule.forRoot(eventsConfig).providers
		};

		EventsModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, EventsModule.moduleSubject.asObservable()).pipe(first()));
	}
}
