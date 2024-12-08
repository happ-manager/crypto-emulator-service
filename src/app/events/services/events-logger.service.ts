import { Injectable } from "@nestjs/common";

import { LoggerService } from "../../libs/logger";

@Injectable()
export class EventsLoggerService {
	constructor(private readonly _loggerService: LoggerService) {}
}
