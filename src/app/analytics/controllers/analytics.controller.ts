import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";

import { ANALYTCIS } from "../constants/analytics.constant";
import { ANALYTCIS_ENDPOINTS } from "../constants/analytics-endpoints.constant";
import { IAnalyticsBody } from "../interfaces/analytics-body.interface";
import { AnalyticsService } from "../services/analytics.service";

@ApiTags(ANALYTCIS)
@Controller(ANALYTCIS_ENDPOINTS.BASE)
export class AnalyticsController {
	constructor(private readonly _analyticsService: AnalyticsService) {}

	@Post(ANALYTCIS_ENDPOINTS.ANALYSE)
	async analyse(@Body() body: IAnalyticsBody) {
		return this._analyticsService.analyse(body);
	}

	@Post(ANALYTCIS_ENDPOINTS.ANALYSE_EXCEL)
	async analsyeExcel(@Body() body: IAnalyticsBody, @Res() res: Response) {
		const analyse = this._analyticsService.analyse(body);

		// Генерация Excel файла
		const buffer: any = [];

		// Установка заголовков и отправка файла
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.setHeader("Content-Disposition", "attachment; filename=find_best_results.xlsx");
		res.send(buffer);
	}
}
