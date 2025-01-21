import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";

import { ExchangeModule } from "../exchange/exchange.module";
import { HeliusModule } from "../shared/modules/helius";
import { SolanaModule } from "../shared/modules/solana";
import { TradingModule } from "../trading/trading.module";
import { HELIUS_CONFIG } from "./configs/helius.config";
import { CORE_SERVICES } from "./services";

@Module({
	imports: [
		HeliusModule.forRoot(HELIUS_CONFIG),
		EventEmitterModule.forRoot(),
		SolanaModule,
		TradingModule,
		ExchangeModule
	],
	providers: [...CORE_SERVICES]
})
export class CoreModule {}
