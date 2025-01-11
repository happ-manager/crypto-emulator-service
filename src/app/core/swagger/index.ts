import type { INestApplication } from "@nestjs/common";

import { authSwagger } from "../../auth/swagger/auth.swagger";
import { candlesSwagger } from "../../candles/swagger/candles.swagger";
import { transactionsSwagger } from "../../candles/swagger/transactions.swagger";
import { channelsSwagger } from "../../channels/swagger/channels.swagger";
import { eventsSwagger } from "../../events/swagger/events.swagger";
import { poolsSwagger } from "../../pools/swagger/pools.swagger";
import { signalsSwagger } from "../../signals/swagger/signals.swagger";
import { tokensSwagger } from "../../tokens/swagger/tokens.swagger";
import { usersSwagger } from "../../users/swagger/users.swagger";
import { walletsSwagger } from "../../wallets/swagger/wallets.swagger";
import { appSwagger } from "./app.swagger";

export function swagger(app: INestApplication) {
	appSwagger(app);
	candlesSwagger(app);
	channelsSwagger(app);
	eventsSwagger(app);
	transactionsSwagger(app);
	tokensSwagger(app);
	walletsSwagger(app);
	signalsSwagger(app);
	poolsSwagger(app);
	authSwagger(app);
	usersSwagger(app);
}
