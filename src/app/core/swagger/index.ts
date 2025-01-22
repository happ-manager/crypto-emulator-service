import type { INestApplication } from "@nestjs/common";

import { analyticsSwagger } from "../../analytics/swagger/analytics.swagger";
import { emulatorSwagger } from "../../emulator/swagger/emulator.swagger";
import { appSwagger } from "./app.swagger";

export function swagger(app: INestApplication) {
	appSwagger(app);
	analyticsSwagger(app);
	emulatorSwagger(app);
}
