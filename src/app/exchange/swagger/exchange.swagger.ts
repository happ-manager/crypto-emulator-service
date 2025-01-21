import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { EXCHANGE } from "../constants/exchange.constant";
import { ExchangeModule } from "../exchange.module";

export function exchangeSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(EXCHANGE).addTag(EXCHANGE).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [ExchangeModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${EXCHANGE}`, app, document);
}
