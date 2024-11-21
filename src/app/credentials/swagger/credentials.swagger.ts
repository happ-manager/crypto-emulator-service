import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { CREDENTIALS } from "../constants/credentials.constant";
import { CredentialsModule } from "../credentials.module";

export function credentialsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(CREDENTIALS).addTag(CREDENTIALS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [CredentialsModule]
	});
	SwaggerModule.setup(`api/swagger/${CREDENTIALS}`, app, document);
}
