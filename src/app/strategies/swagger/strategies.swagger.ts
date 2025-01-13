import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { STRATEGIES } from "../constants/strategies/strategies.constant";
import { StrategiesModule } from "../strategies.module";

export function strategiesSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(STRATEGIES).addTag(STRATEGIES).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [StrategiesModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${STRATEGIES}`, app, document);
}
