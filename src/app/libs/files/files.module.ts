import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { LoggerModule } from "../logger";
import { FILES_CONFIG } from "./injection-tokens/files-config.injection-token";
import type { IFilesConfig } from "./interfaces/files.interface";
import { FILES_SERVICES } from "./services";

@Module({
	imports: [LoggerModule.forChild()],
	providers: FILES_SERVICES,
	exports: FILES_SERVICES
})
export class FilesModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(filesConfig: IFilesConfig): DynamicModule {
		const dynamicModule = {
			module: FilesModule,
			providers: [
				{
					provide: FILES_CONFIG,
					useValue: filesConfig
				}
			]
		};

		FilesModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, FilesModule.moduleSubject.asObservable()).pipe(first()));
	}
}
