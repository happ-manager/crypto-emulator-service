import { Module } from "@nestjs/common";

import { EXCEL_SERVICES } from "./services";

@Module({
	providers: EXCEL_SERVICES,
	exports: EXCEL_SERVICES
})
export class ExcelModule {}
