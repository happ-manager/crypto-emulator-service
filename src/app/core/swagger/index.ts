import type { INestApplication } from "@nestjs/common";

import { authSwagger } from "../../auth/swagger/auth.swagger";
import { usersSwagger } from "../../users/swagger/users.swagger";
import { appSwagger } from "./app.swagger";

export function swagger(app: INestApplication) {
	appSwagger(app);
	authSwagger(app);
	usersSwagger(app);
}
