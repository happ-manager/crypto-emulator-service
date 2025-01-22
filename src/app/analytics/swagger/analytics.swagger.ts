import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { AnalyticsModule } from "../analytics.module";
import { ANALYTCIS } from "../constants/analytics.constant";

export function analyticsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(ANALYTCIS).addTag(ANALYTCIS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [AnalyticsModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${ANALYTCIS}`, app, document);
}
