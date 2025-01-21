import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { AUTO_TRADING } from "../constants/trading.constant";
import { TradingModule } from "../trading.module";

export function tradingSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(AUTO_TRADING).addTag(AUTO_TRADING).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [TradingModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${AUTO_TRADING}`, app, document);
}
