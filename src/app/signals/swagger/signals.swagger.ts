import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { SIGNALS } from "../constants/signals.constant";
import { SignalsModule } from "../signals.module";

export function signalsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(SIGNALS).addTag(SIGNALS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [SignalsModule]
	});
	SwaggerModule.setup(`api/swagger/${SIGNALS}`, app, document);
}
