import * as cluster from "node:cluster";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { cpus } from "os";

import { CoreModule } from "./app/core/core.module";
import { swagger } from "./app/core/swagger";
import { PREFIX, SWAGGER } from "./app/shared/constants/prefix.constant";
import { environment } from "./environments/environment";

async function bootstrap() {
	const app = await NestFactory.create(CoreModule);

	// Устанавливаем лимит на размер тела запроса (например, 100 MB)
	app.use(bodyParser.json({ limit: "100mb" }));
	app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

	app.enableCors();
	app.setGlobalPrefix(PREFIX);

	swagger(app);

	await app.listen(environment.port);
}

if ((cluster as any).isPrimary) {
	const numCPUs = cpus().length;
	const logger = new Logger("Cluster");

	logger.log(`🚀 Primary process is running. Forking ${numCPUs} workers...`);

	for (let i = 0; i < numCPUs; i++) {
		(cluster as any).fork();
	}

	(cluster as any).on("exit", (worker) => {
		logger.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
		(cluster as any).fork();
	});
} else {
	bootstrap().then(() => {
		const logger = new Logger("Bootstrap");

		logger.log(`🚀 Worker ${process.pid} running emulator service on: http://localhost:${environment.port}/${PREFIX}`);
		logger.log(`🚀 Swagger is running on: http://localhost:${environment.port}/${PREFIX}/${SWAGGER}`);
		logger.log(`🚀 Graphql is running on: http://localhost:${environment.port}/graphql`);
	});
}
