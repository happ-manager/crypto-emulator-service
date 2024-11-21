import { CandleResolver } from "./candles/candle.resolver";
import { CandlesResolver } from "./candles/candles.resolver";
import { TransactionResolver } from "./transactions/transaction.resolver";
import { TransactionsResolver } from "./transactions/transactions.resolver";

export const CANDLES_RESOLVERS = [CandlesResolver, CandleResolver, TransactionsResolver, TransactionResolver];
