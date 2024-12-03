import { Module } from "@nestjs/common";

import { TESTS_CONTROLLERS } from "./controllers";
import { TESTS_SERVICES } from "./services";

@Module({
	controllers: TESTS_CONTROLLERS,
	imports: [],
	providers: TESTS_SERVICES
})
export class TestsModule {}
