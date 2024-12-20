import { Module } from "@nestjs/common";

import { CandlesModule } from "../candles/candles.module";
import { DateModule } from "../libs/date";
import { ExcelModule } from "../libs/excel";
import { LoggerModule } from "../libs/logger";
import { SignalsModule } from "../signals/signals.module";
import { StrategiesModule } from "../strategies/strategies.module";
import { EMULATOR_CONTROLLERS } from "./controllers";
import { EMULATOR_SERVICES } from "./services";

@Module({
	controllers: EMULATOR_CONTROLLERS,
	imports: [
		DateModule.forChild(),
		LoggerModule.forChild(),
		ExcelModule,
		SignalsModule,
		StrategiesModule,
		CandlesModule
	],
	providers: EMULATOR_SERVICES,
	exports: EMULATOR_SERVICES
})
export class EmulatorModule {}
