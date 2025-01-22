import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "fs";

import { environment } from "../../../environments/environment";
import { DATA_ENTITIES } from "../../data/entities";

export const TYPEORM_CONFIG: TypeOrmModuleOptions = {
	logging: false,
	type: "postgres",
	host: environment.database.host,
	port: environment.database.port,
	username: environment.database.username,
	password: environment.database.password,
	database: environment.database.name,
	entities: [...DATA_ENTITIES],
	synchronize: false,
	subscribers: [],
	extra: {
		// Настройки пула соединений
		connectionLimit: 10,
		max: 10, // Максимальное количество соединений в пуле
		min: 2, // Минимальное количество соединений в пуле
		idleTimeoutMillis: 30_000, // Время ожидания, после которого соединение считается неактивным и закрывается
		connectionTimeoutMillis: 2000 // Время, в течение которого будет ожидаться установление соединения с БД
	},
	...(environment.database.certificate
		? {
				ssl: {
					ca: fs.readFileSync("ca-certificate.crt")
				}
			}
		: {})
};
