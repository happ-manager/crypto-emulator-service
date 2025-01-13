import type { JwtModuleOptions } from "@nestjs/jwt";
import { environment } from "src/environments/environment";

export const JWT_CONFIG: JwtModuleOptions = {
	secret: environment.jwt.secret
};
