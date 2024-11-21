import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { environment } from "../../../environments/environment";

export function appSwagger(app: INestApplication) {
	const config = new DocumentBuilder().setTitle("happ").addBearerAuth().build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(`${environment.production ? "" : "api/"}swagger`, app, document);
}
