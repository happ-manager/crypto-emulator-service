import { environment } from "../../../environments/environment";
import type { IHeliusConfig } from "../../shared/modules/helius";

export const HELIUS_CONFIG: IHeliusConfig = {
	apiKey: environment.helius.apiKey,
	stakedRpcUrl: environment.helius.stakedRpcUrl,
	enhancedWebsocketUrl: environment.helius.enhancedWebsocketUrl
};
