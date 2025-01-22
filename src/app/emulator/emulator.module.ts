import { Module } from "@nestjs/common";

import { DataModule } from "../data/data.module";
import { EMULATOR_CONTROLLERS } from "./controllers";
import { EMULATOR_SERVICES } from "./services";

@Module({
	imports: [DataModule],
	controllers: EMULATOR_CONTROLLERS,
	providers: [...EMULATOR_SERVICES]
})
export class EmulatorModule {}
