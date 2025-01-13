import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "fs";
import { environment } from "src/environments/environment";

import { POOLS_ENTITIES } from "../../pools/entities";
import { STRATEGIES_ENTITIES } from "../../strategies/entities";
import { TRADING_ENTITIES } from "../../trading/entities";
import { WALLETS_ENTITIES } from "../../wallets/entities";

export const TYPEORM_CONFIG: TypeOrmModuleOptions = {
	logging: false,
	type: "postgres",
	host: environment.database.host,
	port: environment.database.port,
	schema: environment.database.schema,
	username: environment.database.username,
	password: environment.database.password,
	database: environment.database.name,
	entities: [...STRATEGIES_ENTITIES, ...TRADING_ENTITIES, ...POOLS_ENTITIES, ...WALLETS_ENTITIES],
	synchronize: true,
	subscribers: [],
	...(environment.database.certificate
		? {
				ssl: {
					ca: fs.readFileSync("ca-certificate.crt")
				}
			}
		: {})
};
