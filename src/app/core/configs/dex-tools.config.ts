import { environment } from "../../../environments/environment";
import type { IDexToolsConfig } from "../../libs/dex-tools";

export const DEX_TOOLS_CONFIG: IDexToolsConfig = {
	key: environment.dexTools.key,
	coinsFile: "dexTools/coins.json",
	candlesFolder: "dexTools/candles/"
};
