import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { Date } from "../../libs/date/decorators/date.decorator";
import { DATA } from "../constants/data.constant";
import { DATA_ENDPOINTS } from "../constants/data-endpoints.constant";
import { ISolscanBody } from "../interfaces/solscan-body.interface";
import { DataService } from "../services/data.service";

@ApiTags(DATA)
@Controller(DATA_ENDPOINTS.BASE)
export class DataController {
	constructor(private readonly _dataService: DataService) {}

	@Post(DATA_ENDPOINTS.IMPORT_FROM_SOLSCAN)
	importFromSolscan(@Body() body: ISolscanBody) {
		return this._dataService.importFromSolscan(body);
	}
}
