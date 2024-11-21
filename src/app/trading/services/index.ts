import { TradingService } from "./trading.service";
import { TradingStrategiesService } from "./trading-strategies.service";
import { TradingTokensService } from "./trading-tokens.service";
import { TradingsService } from "./tradings.service";

export const TRADING_SERVICES = [TradingsService, TradingService, TradingTokensService, TradingStrategiesService];
