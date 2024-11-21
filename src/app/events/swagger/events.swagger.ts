import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { EVENTS } from "../constants/events.constant";
import { EventsModule } from "../events.module";

export function eventsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(EVENTS).addTag(EVENTS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [EventsModule]
	});
	SwaggerModule.setup(`api/swagger/${EVENTS}`, app, document);
}
