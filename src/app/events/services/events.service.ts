import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import type { EventsEnum } from "../enums/events.enum";
import { EventsGateway } from "../gateways/event.gateway";

@Injectable()
export class EventsService {
	constructor(
		private readonly _eventEmitter2: EventEmitter2,
		private readonly _eventsGateway: EventsGateway
	) {}

	emit(eventType: EventsEnum, body?: unknown, socket = false) {
		this._eventEmitter2.emit(eventType, body);

		if (!socket) {
			return;
		}

		this._eventsGateway.emit(eventType, body);
	}
}
