import { environment } from "../../../environments/environment";
import type { ITelegramConfig } from "../../libs/telegram";

export const TELEGRAM_CONFIG: ITelegramConfig = {
	disabled: environment.telegram.disabled,
	apiId: environment.telegram.appId,
	apiHash: environment.telegram.appHash,
	stringSession: environment.telegram.stringSession
};
