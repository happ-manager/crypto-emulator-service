import { WarmupService } from "../../helius/services/warmup.service";
import { SolanaService } from "./solana.service";
import { SolanaPriceService } from "./solana-price.service";
import { SwapService } from "./swap.service";
import { TransactionBuilderService } from "./transaction-builder.service";

export const SOLANA_SERVICES = [
	WarmupService,
	SwapService,
	TransactionBuilderService,
	SolanaPriceService,
	SolanaService
];
