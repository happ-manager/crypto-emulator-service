import { environment } from "../../../environments/environment";
import type { ILoggerConfig } from "../../libs/logger";

export const LOGGER_CONFIG: ILoggerConfig = {
	filePath: "logs/log.txt",
	production: environment.production
};
