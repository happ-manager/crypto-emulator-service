import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { TRADING } from "../constants/trading/trading.constant";
import { TradingModule } from "../trading.module";

export function tradingSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(TRADING).addTag(TRADING).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [TradingModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${TRADING}`, app, document);
}
