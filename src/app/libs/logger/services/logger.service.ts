import type { LoggerService as NestLoggerService, OnModuleInit } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as winston from "winston";

import { LOGGER_CONFIG } from "../injection-tokens/logger-config.injection-token";
import { ILoggerConfig } from "../interfaces/logger-config.interface";

@Injectable()
export class LoggerService implements NestLoggerService, OnModuleInit {
	private logger: winston.Logger;

	constructor(@Inject(LOGGER_CONFIG) private readonly _loggerConfig: ILoggerConfig) {}

	onModuleInit() {
		const logDir = path.join(process.cwd(), "logs");
		const { pid } = process; // ID процесса

		// Общие форматы
		const logFormat = winston.format.combine(
			winston.format.timestamp({ format: "MM/DD/YYYY, HH:mm:ss:SSS" }),
			winston.format.printf(
				({ level, message, timestamp, stack }) =>
					`[NEST] ${pid}  - ${timestamp}   ${level.toUpperCase()} [LoggerService] ${stack || message}`
			)
		);

		const logsTransport = new winston.transports.File({ filename: path.join(logDir, "logs.txt") });
		const errorTransport = new winston.transports.File({ filename: path.join(logDir, "errors.txt"), level: "error" });
		const consoleTransport = new winston.transports.Console();

		const fileTransports: winston.transport[] = [logsTransport, errorTransport];

		if (!this._loggerConfig.production) {
			fileTransports.push(consoleTransport);
		}

		this.logger = winston.createLogger({
			level: "info",
			format: logFormat,
			transports: fileTransports
		});
	}

	log(message: string) {
		this.logger.info(message);
	}

	error(message: string, trace?: string) {
		this.logger.error(message, { stack: trace });
	}

	warn(message: string) {
		this.logger.warn(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	verbose(message: string) {
		this.logger.verbose(message);
	}
}
