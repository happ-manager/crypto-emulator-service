import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { TESTS } from "../constants/tests.constant";
import { TestsModule } from "../tests.module";

export function testsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(TESTS).addTag(TESTS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [TestsModule]
	});
	SwaggerModule.setup(`api/swagger/${TESTS}`, app, document);
}
