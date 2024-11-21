import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import type { Response } from "express";

@Injectable()
export class ExcelService {
	constructor() {}

	sendExcel(res: Response, excelBuffer: ExcelJS.Buffer) {
		res.setHeader("Content-Disposition", 'attachment; filename="trading_tokens_analysis.xlsx"');
		res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		res.send(excelBuffer);
	}

	// Метод для создания нового Excel-буфера
	async createWorkbook(): Promise<ExcelJS.Workbook> {
		return new ExcelJS.Workbook();
	}

	// Метод для добавления листа с заголовками в Workbook
	addWorksheet(workbook: ExcelJS.Workbook, sheetName: string, columns: any[]): ExcelJS.Worksheet {
		const worksheet = workbook.addWorksheet(sheetName);
		worksheet.columns = columns;
		return worksheet;
	}

	// Метод для добавления данных на лист с разделением пустой строкой
	addGroupedData(worksheet: ExcelJS.Worksheet, groupedData: Record<string, any[]>): void {
		for (const token in groupedData) {
			if (groupedData.hasOwnProperty(token)) {
				const transactions = groupedData[token];
				for (const row of transactions) {
					worksheet.addRow(row);
				}
				// Добавляем пустую строку для разделения групп
				worksheet.addRow([]);
			}
		}
	}

	// Метод для сохранения Workbook в буфер
	async saveWorkbookToBuffer(workbook: ExcelJS.Workbook): Promise<ExcelJS.Buffer> {
		return workbook.xlsx.writeBuffer();
	}
}
