import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { EventsModule } from "../../events/events.module";
import { HeliusModule } from "../helius";
import { RaydiumModule } from "../raydium";
import { SOLANA_CONTROLLERS } from "./controllers";
import { SOLANA_SERVICES } from "./services";

@Module({
	controllers: SOLANA_CONTROLLERS,
	imports: [EventsModule.forChild(), HeliusModule.forChild(), RaydiumModule, HttpModule],
	providers: SOLANA_SERVICES,
	exports: SOLANA_SERVICES
})
export class SolanaModule {}
