import { Module } from "@nestjs/common";

import { FilesModule } from "../files";
import { LoggerModule } from "../logger";
import { RAYDIUM_SERVICES } from "./services";

@Module({
	imports: [LoggerModule.forChild(), FilesModule.forChild()],
	providers: RAYDIUM_SERVICES,
	exports: RAYDIUM_SERVICES
})
export class RaydiumModule {}
