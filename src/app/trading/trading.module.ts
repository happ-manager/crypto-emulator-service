import { Module } from "@nestjs/common";

import { HeliusModule } from "../shared/modules/helius";
import { SolanaModule } from "../shared/modules/solana";
import { AUTO_TRADING_CONTROLLERS } from "./controllers";
import { AUTO_TRADING_SERVICES } from "./services";

@Module({
	imports: [SolanaModule, HeliusModule.forChild()],
	controllers: AUTO_TRADING_CONTROLLERS,
	providers: [...AUTO_TRADING_SERVICES],
	exports: [...AUTO_TRADING_SERVICES]
})
export class TradingModule {}
