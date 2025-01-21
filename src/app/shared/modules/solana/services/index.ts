import { SolanaService } from "./solana.service";
import { SolanaBlockhashService } from "./solana-blockhash.service";
import { SolanaPriceService } from "./solana-price.service";
import { SolanaTransactiosnStatusService } from "./solana-transaction-status.service";

export const SOLANA_SERVICES = [
	SolanaPriceService,
	SolanaBlockhashService,
	SolanaService,
	SolanaTransactiosnStatusService
];
