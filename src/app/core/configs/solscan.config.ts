import { environment } from "../../../environments/environment";
import type { ISolscanConfig } from "../../libs/solscan";

export const SOLSCAN_CONFIG: ISolscanConfig = {
	keyV1: environment.solscan.keyV1,
	keyV2: environment.solscan.keyV2
};
