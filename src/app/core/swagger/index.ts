import type { INestApplication } from "@nestjs/common";

import { exchangeSwagger } from "../../exchange/swagger/exchange.swagger";
import { tradingSwagger } from "../../trading/swagger/trading.swagger";
import { appSwagger } from "./app.swagger";

export function swagger(app: INestApplication) {
	appSwagger(app);
	tradingSwagger(app);
	exchangeSwagger(app);
}
