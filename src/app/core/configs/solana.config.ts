import { environment } from "../../../environments/environment";
import type { ISolanaConfig } from "../../libs/solana";

export const SOLANA_CONFIG: ISolanaConfig = {
	key: environment.coinGecko.key,
	radiumWallet: environment.solana.radiumWallet,
	pumpFunWallet: environment.solana.pumpFunWallet,
	heliusApiKey: environment.solana.heliusApiKey,
	heliusStakedRpcUrl: environment.solana.heliusStakedRpcUrl,
	heliusEnhancedWebsocketUrl: environment.solana.heliusEnhancedWebsocketUrl
};
