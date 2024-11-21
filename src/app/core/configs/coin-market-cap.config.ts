import { environment } from "../../../environments/environment";
import type { ICoinMarketCapConfig } from "../../libs/coin-market-cap";

export const COIN_MARKET_CAP_CONFIG: ICoinMarketCapConfig = {
	key: environment.coinMarketCap.key
};
