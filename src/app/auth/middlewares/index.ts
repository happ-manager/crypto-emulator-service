import type { INestApplication } from "@nestjs/common";

import { AuthMiddleware } from "./auth/auth.middleware";

export const AUTH_MIDDLEWARES = [AuthMiddleware];

export function authMiddlewares(app: INestApplication) {
	const authMiddleware = app.get(AuthMiddleware);
	app.use(authMiddleware.use.bind(authMiddleware));
}
