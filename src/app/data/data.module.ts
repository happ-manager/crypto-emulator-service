import { Module } from "@nestjs/common";

import { DateModule } from "../libs/date";
import { LoggerModule } from "../libs/logger";
import { SolscanModule } from "../libs/solscan";
import { SignalsModule } from "../signals/signals.module";
import { DATA_CONTROLLERS } from "./controllers";
import { DATA_SERVICES } from "./services";

@Module({
	controllers: DATA_CONTROLLERS,
	imports: [LoggerModule.forChild(), SolscanModule.forChild(), DateModule.forChild(), SignalsModule],
	providers: DATA_SERVICES
})
export class DataModule {}
