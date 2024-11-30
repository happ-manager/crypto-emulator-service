import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import * as ExcelJS from "exceljs";
import { Response } from "express";

import { ExcelService } from "../../libs/excel";
import { EMULATOR } from "../constants/emulator.constant";
import { IEmulateBody } from "../interfaces/emulator-body.interface";
import { EmulatorService } from "../services/emulator.service";

@ApiTags(EMULATOR)
@Controller(EMULATOR)
export class EmulatorController {
	constructor(
		private readonly _emulatorService: EmulatorService,
		private readonly _excelService: ExcelService
	) {}

	@Post("emulate")
	async emulate(@Body() body: IEmulateBody) {
		return this._emulatorService.emulate(body);
	}

	@Post("emulate/excel")
	async emulateToExcel(@Body() body: IEmulateBody, @Res() res: Response) {
		const result = await this._emulatorService.emulate(body);

		// Создание книги Excel
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Результаты эмуляции");

		// Генерация Excel файла
		const buffer = await workbook.xlsx.writeBuffer();

		// Установка заголовков и отправка файла
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.setHeader("Content-Disposition", "attachment; filename=emulation_results.xlsx");
		res.send(buffer);
	}
}
