import { AccessTradingTokenGuard } from "./trading-tokens/access-trading-token.guard";
import { CreateTradingTokenGuard } from "./trading-tokens/create-trading-token.guard";
import { AccessTradingGuard } from "./tradings/access-trading.guard";
import { CreateTradingGuard } from "./tradings/create-trading.guard";

export const TRADINGS_GUARDS = [
	CreateTradingGuard,
	AccessTradingGuard,
	CreateTradingTokenGuard,
	AccessTradingTokenGuard
];
