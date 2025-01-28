import * as cluster1 from "node:cluster";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { cpus } from "os";

import { CoreModule } from "./app/core/core.module";
import { swagger } from "./app/core/swagger";
import { PREFIX, SWAGGER } from "./app/shared/constants/prefix.constant";
import { environment } from "./environments/environment";

const logger = new Logger("Main");

async function bootstrap() {
	const app = await NestFactory.create(CoreModule);

	app.use(bodyParser.json({ limit: "100mb" }));
	app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

	app.enableCors();
	app.setGlobalPrefix(PREFIX);

	swagger(app);

	await app.listen(environment.port);
}

const cluster = cluster1 as any;

if (cluster.isPrimary) {
	if (environment.runWokers) {
		runWorkers();
	}

	bootstrap().then(() => {
		logger.log(`🚀 Emulator service running on: http://localhost:${environment.port}/${PREFIX}`);
		logger.log(`🚀 Swagger is running on: http://localhost:${environment.port}/${PREFIX}/${SWAGGER}`);
		logger.log(`🚀 Graphql is running on: http://localhost:${environment.port}/graphql`);
	});
}

function runWorkers() {
	logger.log(`Running ${cpus().length} workers...`);

	for (let i = 0; i < cpus().length; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		logger.warn(`Worker ${worker.process.pid} exited with code ${code}, signal ${signal}. Restarting...`);
		cluster.fork();
	});
}
