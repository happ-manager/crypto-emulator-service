import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { EMULATOR } from "../constants/emulator.constant";
import { EmulatorModule } from "../emulator.module";

export function emulatorSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(EMULATOR).addTag(EMULATOR).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [EmulatorModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${EMULATOR}`, app, document);
}
