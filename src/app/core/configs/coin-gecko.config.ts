import { environment } from "../../../environments/environment";
import type { ICoinMarketCapConfig } from "../../libs/coin-market-cap";

export const COIN_GEKO_CONFIG: ICoinMarketCapConfig = {
	key: environment.coinGecko.key
};
