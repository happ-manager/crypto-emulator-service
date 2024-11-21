import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

import { LoggerService } from "../../logger";
import { FILES_CONFIG } from "../injection-tokens/files-config.injection-token";
import { IFilesConfig } from "../interfaces/files.interface";

@Injectable()
export class FilesService {
	private baseDir = path.join(__dirname, this._filesConfig.baseUrl); // базовая директория для всех файлов

	constructor(
		@Inject(FILES_CONFIG) private readonly _filesConfig: IFilesConfig,
		private readonly _loggerService: LoggerService
	) {}

	// Метод для создания нового файла с указанными данными
	createFile(relativeFilePath: string, data: any, isTextFile = false): void {
		const filePath = path.join(this.baseDir, relativeFilePath);
		try {
			if (!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath, data, "utf-8");
			}
		} catch (error) {
			this._loggerService.error("Error creating file:", error);
		}
	}

	// Метод для получения содержимого файла
	getFile(relativeFilePath: string, isTextFile = false): any {
		const filePath = path.join(this.baseDir, relativeFilePath);
		try {
			if (fs.existsSync(filePath)) {
				const fileData = fs.readFileSync(filePath, "utf-8").trim();
				return isTextFile ? fileData : JSON.parse(fileData);
			}
		} catch (error) {
			this._loggerService.error("Error reading file:", error);
		}
	}

	// Метод для добавления данных в файл
	appendToFile(relativeFilePath: string, data: string): void {
		const filePath = path.join(this.baseDir, relativeFilePath);
		try {
			fs.appendFileSync(filePath, data, "utf-8");
		} catch (error) {
			this._loggerService.error("Error appending to file:", error);
		}
	}

	// Метод для очистки содержимого файла
	clearFile(relativeFilePath: string): void {
		const filePath = path.join(this.baseDir, relativeFilePath);
		try {
			fs.writeFileSync(filePath, "", "utf-8");
		} catch (error) {
			this._loggerService.error("Error clearing file:", error);
		}
	}

	// Метод для создания или перезаписи файла с указанными данными
	createOrUpdateFile(relativeFilePath: string, data: any): void {
		const filePath = path.join(this.baseDir, relativeFilePath);
		try {
			// Всегда записываем данные в файл, независимо от его существования
			fs.writeFileSync(filePath, data, "utf-8");
		} catch (error) {
			this._loggerService.error("Error creating or updating file:", error);
		}
	}

	initializeFolders(folderNames: string[]): void {
		for (const folderName of folderNames) {
			const folderPath = path.join(this.baseDir, folderName);
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath, { recursive: true });
			}
		}
	}
}
