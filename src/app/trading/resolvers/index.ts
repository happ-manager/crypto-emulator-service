import { TradingTokenResolver } from "./trading-tokens/trading-token.resolver";
import { TradingTokensResolver } from "./trading-tokens/trading-tokens.resolver";
import { TradingResolver } from "./tradings/trading.resolver";
import { TradingsResolver } from "./tradings/tradings.resolver";

export const TRADINGS_RESOLVERS = [TradingsResolver, TradingResolver, TradingTokensResolver, TradingTokenResolver];
