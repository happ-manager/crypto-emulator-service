import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AuthModule } from "../auth.module";
import { AUTH } from "../constants/auth.constant";

export function authSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(AUTH).addTag(AUTH).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [AuthModule]
	});
	SwaggerModule.setup(`api/swagger/${AUTH}`, app, document);
}
