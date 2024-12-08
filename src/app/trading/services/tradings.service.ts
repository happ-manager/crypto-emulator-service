import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { TradingEntity } from "../entities/trading.entity";
import type { ITrading } from "../interfaces/trading.interface";

@Injectable()
export class TradingsService {
	constructor(
		@InjectRepository(TradingEntity) private readonly _tradingsRepository: Repository<TradingEntity>,
		private readonly _loggerService: LoggerService
	) {}

	async getTrading(options?: FindOneOptions<TradingEntity>) {
		return this._tradingsRepository.findOne(options);
	}

	async getTradings(options?: FindManyOptions<TradingEntity>) {
		const [data, count] = await this._tradingsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createTrading(trading: DeepPartial<ITrading>) {
		try {
			const savedTrading = await this._tradingsRepository.save(trading);

			return await this._tradingsRepository.findOne({ where: { id: savedTrading.id } });
		} catch (error) {
			this._loggerService.error(error, "createTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateTrading(id: string, trading: DeepPartial<ITrading>) {
		try {
			await this._tradingsRepository.save({ id, ...trading });
			return await this._tradingsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error, "updateTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteTrading(id: string) {
		try {
			await this._tradingsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
