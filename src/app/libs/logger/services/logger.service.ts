import type { LoggerService as NestLoggerService } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import * as winston from "winston";

@Injectable()
export class LoggerService implements NestLoggerService {
	private logger: winston.Logger;

	init() {
		const { pid } = process; // ID процесса

		// Общие форматы
		const logFormat = winston.format.combine(
			winston.format.timestamp({ format: "MM/DD/YYYY, HH:mm:ss:SSS" }),
			winston.format.printf(
				({ level, message, timestamp, stack }) =>
					`[NEST] ${pid}  - ${timestamp}   ${level.toUpperCase()} [${stack}] ${message}`
			)
		);

		const consoleTransport = new winston.transports.Console();

		this.logger = winston.createLogger({
			level: "info",
			format: logFormat,
			transports: [consoleTransport]
		});

		this.log("Logger is running", "LoggerService");
	}

	log(message: string, stack?: string) {
		this.logger.info(message, { stack });
	}

	error(message: string, stack?: string) {
		this.logger.error(message, { stack });
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
