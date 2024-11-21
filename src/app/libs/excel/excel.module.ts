import type { DynamicModule } from "@nestjs/common";
import { Module } from "@nestjs/common";
import type { Observable } from "rxjs";
import { first, interval, lastValueFrom, map, race, Subject } from "rxjs";

import { EXCEL_CONFIG } from "./injection-tokens/excel-config.injection-token";
import type { IExcelConfig } from "./interfaces/excel.interface";
import { EXCEL_SERVICES } from "./services";

@Module({
	providers: EXCEL_SERVICES,
	exports: EXCEL_SERVICES
})
export class ExcelModule {
	static moduleSubject = new Subject<DynamicModule>();

	static forRoot(excelConfig: IExcelConfig): DynamicModule {
		const dynamicModule = {
			module: ExcelModule,
			providers: [
				{
					provide: EXCEL_CONFIG,
					useValue: excelConfig
				}
			]
		};

		ExcelModule.moduleSubject.next(dynamicModule);

		return dynamicModule;
	}

	static async forChild() {
		const timeout$: Observable<DynamicModule> = interval(0).pipe(
			map(() => {
				throw new Error("Expected at least one forRoot");
			})
		);

		return lastValueFrom(race(timeout$, ExcelModule.moduleSubject.asObservable()).pipe(first()));
	}
}
