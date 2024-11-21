import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { ChannelsModule } from "../channels.module";
import { CHANNELS } from "../constants/channels.constant";

export function channelsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(CHANNELS).addTag(CHANNELS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [ChannelsModule]
	});
	SwaggerModule.setup(`api/swagger/${CHANNELS}`, app, document);
}
