import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { TOKENS } from "../constants/tokens.constant";
import { TokensModule } from "../tokens.module";

export function tokensSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(TOKENS).addTag(TOKENS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [TokensModule]
	});
	SwaggerModule.setup(`api/swagger/${TOKENS}`, app, document);
}
