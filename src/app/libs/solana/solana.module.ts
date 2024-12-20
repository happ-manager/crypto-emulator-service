import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { EventsModule } from "../../events/events.module";
import { DateModule } from "../date";
import { FilesModule } from "../files";
import { HeliusModule } from "../helius";
import { LoggerModule } from "../logger";
import { RaydiumModule } from "../raydium";
import { SOLANA_SERVICES } from "./services";

@Module({
	imports: [
		EventsModule.forChild(),
		LoggerModule.forChild(),
		DateModule.forChild(),
		FilesModule.forChild(),
		HeliusModule.forChild(),
		RaydiumModule,
		HttpModule
	],
	providers: SOLANA_SERVICES,
	exports: SOLANA_SERVICES
})
export class SolanaModule {}
