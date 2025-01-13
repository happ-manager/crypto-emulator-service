import type { INestApplication } from "@nestjs/common";

import { poolsSwagger } from "../../pools/swagger/pools.swagger";
import { strategiesSwagger } from "../../strategies/swagger/strategies.swagger";
import { walletsSwagger } from "../../wallets/swagger/wallets.swagger";
import { appSwagger } from "./app.swagger";

export function swagger(app: INestApplication) {
	appSwagger(app);
	poolsSwagger(app);
	walletsSwagger(app);
	strategiesSwagger(app);
}
