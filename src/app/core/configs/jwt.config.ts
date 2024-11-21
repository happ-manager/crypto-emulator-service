import { environment } from "../../../environments/environment";
import type { IJwtConfig } from "../../libs/jwt";

export const JWT_CONFIG: IJwtConfig = {
	secret: environment.jwt.secret
};
