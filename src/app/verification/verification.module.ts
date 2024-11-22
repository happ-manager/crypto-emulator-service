import { Module } from "@nestjs/common";

import { EventsModule } from "../events/events.module";
import { LoggerModule } from "../libs/logger";
import { TelegramModule } from "../libs/telegram";
import { TradingModule } from "../trading/trading.module";
import { VERIFICATION_CONTROLLERS } from "./controllers";
import { VERIFICATION_SERVICES } from "./services";

@Module({
	imports: [TelegramModule.forChild(), LoggerModule.forChild(), TradingModule, EventsModule.forChild()],
	controllers: VERIFICATION_CONTROLLERS,
	providers: VERIFICATION_SERVICES,
	exports: VERIFICATION_SERVICES
})
export class VerificationModule {}
