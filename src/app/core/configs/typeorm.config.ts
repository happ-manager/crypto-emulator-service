import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "fs";
import { environment } from "src/environments/environment";

import { CANDLES_ENTITIES } from "../../candles/entities";
import { CHANNELS_ENTITIES } from "../../channels/entities";
import { CREDENTIALS_ENTITIES } from "../../credentials/entities";
import { SIGNALS_ENTITIES } from "../../signals/entities";
import { STRATEGIES_ENTITIES } from "../../strategies/entities";
import { TOKENS_ENTITIES } from "../../tokens/entities";
import { TRADING_ENTITIES } from "../../trading/entities";
import { USERS_ENTITIES } from "../../users/entities";
import { WALLETS_ENTITIES } from "../../wallets/entities";

export const TYPEORM_CONFIG: TypeOrmModuleOptions = {
	logging: false,
	type: "postgres",
	host: environment.database.host,
	port: environment.database.port,
	username: environment.database.username,
	password: environment.database.password,
	database: environment.database.name,
	entities: [
		...USERS_ENTITIES,
		...CREDENTIALS_ENTITIES,
		...CHANNELS_ENTITIES,
		...TOKENS_ENTITIES,
		...TRADING_ENTITIES,
		...SIGNALS_ENTITIES,
		...STRATEGIES_ENTITIES,
		...CANDLES_ENTITIES,
		...WALLETS_ENTITIES
	],
	synchronize: true,
	migrationsTableName: "happ-crypto-migrations",
	migrationsRun: false,
	subscribers: [],
	...(environment.database.certificate
		? {
				ssl: {
					ca: fs.readFileSync("ca-certificate.crt")
				}
			}
		: {})
};
