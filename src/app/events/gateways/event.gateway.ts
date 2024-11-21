import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

import type { EventsEnum } from "../enums/events.enum";

@WebSocketGateway({ cors: true })
export class EventsGateway {
	@WebSocketServer()
	server: Server;

	emit(eventType: EventsEnum, body: unknown) {
		this.server.emit(eventType, body);
	}
}
