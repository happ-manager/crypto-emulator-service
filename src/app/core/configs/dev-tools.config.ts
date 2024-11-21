import { environment } from "../../../environments/environment";

export const DEV_TOOLS_CONFIG = {
	http: !environment.production
};
