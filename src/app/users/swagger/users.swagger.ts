import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { USERS } from "../constants/users.constant";
import { UsersModule } from "../users.module";

export function usersSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(USERS).addTag(USERS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [UsersModule]
	});
	SwaggerModule.setup(`api/swagger/${USERS}`, app, document);
}
