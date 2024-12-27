import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import type { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { TradingTokenEntity } from "../entities/trading-token.entity";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";

interface IMilestoneProcess {
	milestone: IChecked<IMilestone>;
	trading: ITrading;
	tradingToken: ITradingToken;
}

@Injectable()
export class TradingTokensService {
	constructor(
		@InjectRepository(TradingTokenEntity) private readonly _tradingTokensRepository: Repository<TradingTokenEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.MILESTONE_CONFIRMED)
	async onMilestoneConfirmed(milestoneProcess: IMilestoneProcess) {
		const { milestone, tradingToken, trading } = milestoneProcess;

		const findedToken = await this._tradingTokensRepository.findOneBy({ id: tradingToken.id });

		if (!findedToken) {
			return;
		}

		const checkedStrategy: IChecked<IStrategy> = {
			...(findedToken.checkedStrategy || trading.strategy),
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

	async createTradingTokens(tradingTokens: DeepPartial<ITradingToken>[]) {
		try {
			const savedTradingTokens = await this._tradingTokensRepository.save(tradingTokens);
			const savedIds = savedTradingTokens.map((savedTradingToken) => savedTradingToken.id);

			const createdTokens = await this._tradingTokensRepository.find({ where: { id: In(savedIds) } });

			this._eventsService.emit(EventsEnum.TRADING_TOKENS_CREATED, createdTokens, true);

			return createdTokens;
		} catch (error) {
			this._loggerService.error(error, "createTradingTokens");
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
