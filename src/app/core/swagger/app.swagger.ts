import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";

export function appSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle("Emulator Service").addBearerAuth().build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}`, app, document);
}
