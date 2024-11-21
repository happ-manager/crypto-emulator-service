import { environment } from "../../../environments/environment";
import type { ISantimentConfig } from "../../libs/santiment";

export const SANTIMENT_CONFIG: ISantimentConfig = {
	key: environment.coinGecko.key
};
