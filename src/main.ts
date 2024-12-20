import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { authMiddlewares } from "./app/auth/middlewares";
import { CoreModule } from "./app/core/core.module";
import { swagger } from "./app/core/swagger";
import { environment } from "./environments/environment";

const prefix = "api";

async function bootstrap() {
	const app = await NestFactory.create(CoreModule, {
		snapshot: true
	});

	app.setGlobalPrefix(prefix);
	app.enableCors();

	authMiddlewares(app);
	swagger(app);

	await app.listen(environment.port);
}
bootstrap().then(() => {
	Logger.log(`🚀 Api is running on: http://localhost:${environment.port}/${prefix}`, "Bootstrap");
	Logger.log(`🚀 Swagger is running on: http://localhost:${environment.port}/${prefix}/swagger`, "Bootstrap");
	Logger.log(`🚀 Graphql is running on: http://localhost:${environment.port}/graphql`, "Bootstrap");
});
