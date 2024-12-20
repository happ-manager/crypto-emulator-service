import { Module } from "@nestjs/common";

import { JSON_SERVICES } from "./services";

@Module({
	providers: JSON_SERVICES,
	exports: JSON_SERVICES
})
export class JsonModule {}
