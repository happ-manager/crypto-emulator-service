import { environment } from "../../../environments/environment";
import type { ITrojanConfig } from "../../libs/trojan";

export const TROJAN_CONFIG: ITrojanConfig = {
	botUsername: environment.trojan.botUsername,
	botId: environment.trojan.botId
};
