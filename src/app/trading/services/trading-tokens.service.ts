import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere } from "typeorm";
import { Repository } from "typeorm";

import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { EventsEnum } from "../../shared/enums/events.enum";
import { getPage } from "../../shared/utils/get-page.util";
import type { ICheckedStrategy } from "../../strategies/interfaces/checked.interface";
import { TradingTokenEntity } from "../entities/trading-token.entity";
import { IMilestoneProcess } from "../interfaces/milestone-pricess.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";

@Injectable()
export class TradingTokensService {
	private readonly _loggerService = new Logger("TradingTokensService");
	constructor(
		@InjectRepository(TradingTokenEntity) private readonly _tradingTokensRepository: Repository<TradingTokenEntity>,
		private readonly _eventsService: EventEmitter2
	) {}

	get repository() {
		return this._tradingTokensRepository;
	}

	@OnEvent(EventsEnum.MILESTONE_CONFIRMED)
	async onMilestoneConfirmed(milestoneProcess: IMilestoneProcess) {
		const { milestone, tradingToken } = milestoneProcess;

		const findedToken = await this._tradingTokensRepository.findOneBy({ id: tradingToken.id });

		if (!findedToken) {
			return;
		}

		const checkedStrategy: ICheckedStrategy = {
			...findedToken.checkedStrategy,
			checkedMilestones: [...(findedToken.checkedStrategy?.checkedMilestones || []), milestone]
		};

		await this.updateTradingToken(findedToken.id, { checkedStrategy });
	}

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
			this._loggerService.error(error, "createTradingToken");
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
			this._loggerService.error(error, "updateTradingToken");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateTradingTokens(criteria: FindOptionsWhere<ITradingToken>, tradingToken: DeepPartial<ITradingToken>) {
		try {
			await this._tradingTokensRepository.update(criteria, { ...tradingToken });

			const updatedTradingTokens = await this._tradingTokensRepository.find({ where: criteria });

			this._eventsService.emit(EventsEnum.TRADING_TOKENS_UPDATED, updatedTradingTokens);

			return updatedTradingTokens;
		} catch (error) {
			this._loggerService.error(error, "updateTradingTokens");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteTradingToken(id: string) {
		try {
			await this._tradingTokensRepository.delete(id);

			this._eventsService.emit(EventsEnum.TRADING_TOKEN_DELETED, id, true);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteTradingToken");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
