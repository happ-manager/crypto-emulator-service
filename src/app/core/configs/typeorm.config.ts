import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "fs";

import { environment } from "../../../environments/environment";

export const TYPEORM_CONFIG: TypeOrmModuleOptions = {
	logging: false,
	type: "postgres",
	host: environment.database.host,
	port: environment.database.port,
	username: environment.database.username,
	password: environment.database.password,
	database: environment.database.name,
	entities: [],
	synchronize: false,
	subscribers: [],
	...(environment.database.certificate
		? {
				ssl: {
					ca: fs.readFileSync("ca-certificate.crt")
				}
			}
		: {})
};
