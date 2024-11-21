import { environment } from "../../../environments/environment";
import type { INomicsConfig } from "../../libs/nomics";

export const NOMICS_CONFIG: INomicsConfig = {
	key: environment.coinGecko.key
};
