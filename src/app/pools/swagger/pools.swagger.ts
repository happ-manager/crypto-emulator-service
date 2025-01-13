import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PREFIX, SWAGGER } from "../../shared/constants/prefix.constant";
import { POOLS } from "../constants/pools.constant";
import { PoolsModule } from "../pools.module";

export function poolsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(POOLS).addTag(POOLS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [PoolsModule]
	});
	SwaggerModule.setup(`${PREFIX}/${SWAGGER}/${POOLS}`, app, document);
}
