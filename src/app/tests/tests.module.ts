import { Module } from "@nestjs/common";

import { DateModule } from "../libs/date";
import { DexToolsModule } from "../libs/dex-tools";
import { TESTS_CONTROLLERS } from "./controllers";
import { TESTS_SERVICES } from "./services";

@Module({
	controllers: TESTS_CONTROLLERS,
	imports: [DexToolsModule.forChild(), DateModule.forChild()],
	providers: TESTS_SERVICES
})
export class TestsModule {}
