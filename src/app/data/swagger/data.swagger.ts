import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { DATA } from "../constants/data.constant";
import { DataModule } from "../data.module";

export function dataSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(DATA).addTag(DATA).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [DataModule]
	});
	SwaggerModule.setup(`api/swagger/${DATA}`, app, document);
}
