import { AccessCandleGuard } from "./candles/access-candle.guard";
import { CreateCandleGuard } from "./candles/create-candle.guard";
import { AccessTransactionGuard } from "./transactions/access-transaction.guard";
import { CreateTransactionGuard } from "./transactions/create-transaction.guard";

export const CANDLES_GUARDS = [CreateCandleGuard, AccessCandleGuard, CreateTransactionGuard, AccessTransactionGuard];
