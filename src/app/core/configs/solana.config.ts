import { HeliusModule } from "../../libs/helius";
import { HeliusService } from "../../libs/helius/services/helius.service";
import type { ISolanaConfig } from "../../libs/solana";
import type { AsyncModuleOptions } from "../../shared/interfaces/async-module-options.interface";
import { HELIUS_CONFIG } from "./helius.config";

export const SOLANA_CONFIG: AsyncModuleOptions<ISolanaConfig> = {
	imports: [HeliusModule.forRoot(HELIUS_CONFIG)],
	inject: [HeliusService],
	useFactory: async (heliusService: HeliusService) => ({
		provider: heliusService
	})
};
