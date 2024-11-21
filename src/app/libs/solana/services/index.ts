import { HeliusService } from "./helius.service";
import { SolanaService } from "./solana.service";
import { SolanaPriceService } from "./utils/solana-price.service";
import { SwapService } from "./utils/swap.service";
import { TransactionBuilderService } from "./utils/transaction-builder.service";
import { WarmupService } from "./utils/warmup.service";

export const SOLANA_SERVICES = [
	WarmupService,
	SwapService,
	TransactionBuilderService,
	SolanaPriceService,
	SolanaService,
	HeliusService
];
