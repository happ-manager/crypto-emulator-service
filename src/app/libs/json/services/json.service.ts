import { Injectable } from "@nestjs/common";
import type { Response } from "express";

@Injectable()
export class JsonService {
	constructor() {}

	sendJson(res: Response, data: any) {
		res.setHeader("Content-Disposition", 'attachment; filename="data.json"');
		res.setHeader("Content-Type", "application/json");
		res.send(JSON.stringify(data, null, 2)); // Форматируем JSON с отступами для удобства чтения
	}
}
