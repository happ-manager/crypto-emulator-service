import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { HeliusModule } from "../helius";
import { SOLANA_CONTROLLERS } from "./controllers";
import { SOLANA_SERVICES } from "./services";

@Module({
	controllers: SOLANA_CONTROLLERS,
	imports: [HeliusModule.forChild(), HttpModule],
	providers: SOLANA_SERVICES,
	exports: SOLANA_SERVICES
})
export class SolanaModule {}
