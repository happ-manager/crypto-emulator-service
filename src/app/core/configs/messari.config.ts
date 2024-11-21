import { environment } from "../../../environments/environment";
import type { IMessariConfig } from "../../libs/messari";

export const MESSARI_CONFIG: IMessariConfig = {
	key: environment.coinGecko.key
};
