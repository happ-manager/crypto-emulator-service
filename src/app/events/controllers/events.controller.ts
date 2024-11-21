import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { EVENTS } from "../constants/events.constant";
import { EventsService } from "../services/events.service";

@ApiTags(EVENTS)
@Controller(EVENTS)
export class EventsController {
	constructor(private readonly _eventsService: EventsService) {}
}
