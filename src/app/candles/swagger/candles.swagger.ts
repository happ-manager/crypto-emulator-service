import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { CandlesModule } from "../candles.module";
import { CANDLES } from "../constants/candles/candles.constant";

export function candlesSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(CANDLES).addTag(CANDLES).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [CandlesModule]
	});
	SwaggerModule.setup(`api/swagger/${CANDLES}`, app, document);
}
