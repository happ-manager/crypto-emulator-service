import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { WALLETS } from "../constants/wallets.constant";
import { WalletsModule } from "../wallets.module";

export function walletsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(WALLETS).addTag(WALLETS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [WalletsModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${WALLETS}`, app, document);
}
