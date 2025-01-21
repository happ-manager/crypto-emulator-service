import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { CoreModule } from "./app/core/core.module";
import { swagger } from "./app/core/swagger";
import { PREFIX, SWAGGER } from "./app/shared/constants/prefix.constant";
import { environment } from "./environments/environment";

async function bootstrap() {
	const app = await NestFactory.create(CoreModule);

	app.enableCors();
	app.setGlobalPrefix(PREFIX);

	swagger(app);

	await app.listen(environment.port);
}

bootstrap().then(() => {
	const logger = new Logger("Bootstrap");

	logger.log(`🚀 Trading service is running on: http://localhost:${environment.port}/${PREFIX}`);
	logger.log(`🚀 Swagger is running on: http://localhost:${environment.port}/${PREFIX}/${SWAGGER}`);
	logger.log(`🚀 Graphql is running on: http://localhost:${environment.port}/graphql`);
});
