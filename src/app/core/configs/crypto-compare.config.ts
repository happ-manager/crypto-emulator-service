import { environment } from "../../../environments/environment";
import type { ICryptoCompareConfig } from "../../libs/crypto-compare";

export const CRYPTO_COMPARE_CONFIG: ICryptoCompareConfig = {
	key: environment.coinGecko.key
};
