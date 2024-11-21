import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { TradingTokenEntity } from "../entities/trading-token.entity";
import type { ITradingToken } from "../interfaces/trading-token.interface";

@Injectable()
export class TradingTokensService {
	constructor(
		@InjectRepository(TradingTokenEntity) private readonly _tradingTokensRepository: Repository<TradingTokenEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	async getTradingToken(options?: FindOneOptions<TradingTokenEntity>) {
		return this._tradingTokensRepository.findOne(options);
	}

	async getTradingTokens(options?: FindManyOptions<TradingTokenEntity>) {
		const [data, count] = await this._tradingTokensRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createTradingToken(tradingToken: DeepPartial<ITradingToken>) {
		try {
			const savedTradingToken = await this._tradingTokensRepository.save(tradingToken);

			const findedTradingToken = await this._tradingTokensRepository.findOne({ where: { id: savedTradingToken.id } });

			this._eventsService.emit(EventsEnum.TRADING_TOKEN_CREATED, findedTradingToken, true);

			return findedTradingToken;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createTradingTokens(tradingTokens: DeepPartial<ITradingToken>[]) {
		try {
			const savedTradingTokens = await this._tradingTokensRepository.save(tradingTokens);
			const savedIds = savedTradingTokens.map((savedTradingToken) => savedTradingToken.id);

			const createdTokens = await this._tradingTokensRepository.find({ where: { id: In(savedIds) } });

			this._eventsService.emit(EventsEnum.TRADING_TOKENS_CREATED, createdTokens, true);

			return createdTokens;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateTradingToken(id: string, tradingToken: DeepPartial<ITradingToken>) {
		try {
			await this._tradingTokensRepository.save({ id, ...tradingToken });

			const updatedTradingToken = await this._tradingTokensRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.TRADING_TOKEN_UPDATED, updatedTradingToken, true);

			return updatedTradingToken;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteTradingToken(id: string) {
		try {
			await this._tradingTokensRepository.delete(id);

			this._eventsService.emit(EventsEnum.TRADING_TOKEN_DELETED, id, true);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
