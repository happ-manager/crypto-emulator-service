import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { CandlesModule } from "../candles.module";
import { TRANSACTIONS } from "../constants/transactions/transactions.constant";

export function transactionsSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle(TRANSACTIONS).addTag(TRANSACTIONS).build();
	const document = SwaggerModule.createDocument(app, config, {
		include: [CandlesModule]
	});
	SwaggerModule.setup(`api/swagger/${TRANSACTIONS}`, app, document);
}
