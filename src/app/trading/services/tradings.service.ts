import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { EventsEnum } from "../../shared/enums/events.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { TradingEntity } from "../entities/trading.entity";
import type { ITrading } from "../interfaces/trading.interface";

@Injectable()
export class TradingsService {
	private readonly _loggerService = new Logger("TradingsService");
	constructor(
		@InjectRepository(TradingEntity) private readonly _tradingsRepository: Repository<TradingEntity>,
		private readonly _eventsService: EventEmitter2
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

			this._eventsService.emit(EventsEnum.TRADING_CREATED, savedTrading, true);

			return await this._tradingsRepository.findOne({ where: { id: savedTrading.id } });
		} catch (error) {
			this._loggerService.error(error, "createTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateTrading(id: string, trading: DeepPartial<ITrading>) {
		try {
			const savedTrading = await this._tradingsRepository.save({ id, ...trading });

			this._eventsService.emit(EventsEnum.TRADING_UPDATED, savedTrading, true);

			return await this._tradingsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error, "updateTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteTrading(id: string) {
		try {
			await this._tradingsRepository.delete(id);

			this._eventsService.emit(EventsEnum.TRADING_DELETED, id, true);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteTrading");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
