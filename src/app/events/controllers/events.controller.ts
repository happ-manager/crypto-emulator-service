import { Controller, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EVENTS } from "../constants/events.constant";
import { EVENTS_ENDPOINTS } from "../constants/events-endpoints.constant";
import { EventsEnum } from "../enums/events.enum";
import { EventsService } from "../services/events.service";

@ApiTags(EVENTS)
@Controller(EVENTS_ENDPOINTS.BASE)
export class EventsController {
	constructor(private readonly _eventsService: EventsService) {}

	@Post(EVENTS_ENDPOINTS.SEND_MESSAGE)
	async sendMessage(@Query("message") message?: string) {
		return this._eventsService.emit(EventsEnum.SEND_MESSAGE, message, true);
	}
}
