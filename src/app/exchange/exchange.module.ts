import { Module } from "@nestjs/common";

import { SolanaModule } from "../shared/modules/solana";
import { EXCHANGE_CONTROLLERS } from "./controllers";
import { EXCHANGE_SERVICES } from "./services";

@Module({
	imports: [SolanaModule],
	controllers: EXCHANGE_CONTROLLERS,
	providers: [...EXCHANGE_SERVICES],
	exports: [...EXCHANGE_SERVICES]
})
export class ExchangeModule {}
