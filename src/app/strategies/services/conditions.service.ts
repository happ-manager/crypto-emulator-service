import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In } from "typeorm";
import { Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { ConditionEntity } from "../entities/condition.entity";
import type { ICondition } from "../interfaces/condition.interface";

@Injectable()
export class ConditionsService {
	constructor(
		@InjectRepository(ConditionEntity)
		private readonly _conditionsRepository: Repository<ConditionEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	async getCondition(options?: FindOneOptions<ConditionEntity>) {
		return this._conditionsRepository.findOne(options);
	}

	async getConditions(options?: FindManyOptions<ConditionEntity>) {
		const [data, count] = await this._conditionsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createCondition(condition: DeepPartial<ICondition>) {
		try {
			const savedCondition = await this._conditionsRepository.save(condition);
			const foundCondition = await this._conditionsRepository.findOne({ where: { id: savedCondition.id } });

			this._eventsService.emit(EventsEnum.STRATEGY_CREATED, foundCondition);

			return foundCondition;
		} catch (error) {
			this._loggerService.error(`createCondition ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createConditions(conditions: DeepPartial<ICondition>[]) {
		try {
			const savedConditions = await this._conditionsRepository.save(conditions);
			const savedCondtionsIds = savedConditions.map((condition) => condition.id);

			const foundConditions = await this._conditionsRepository.find({ where: { id: In(savedCondtionsIds) } });

			this._eventsService.emit(EventsEnum.CONDITIONS_CREATED, foundConditions);

			return foundConditions;
		} catch (error) {
			this._loggerService.error(`createConditions ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateCondition(id: string, condition: DeepPartial<ICondition>) {
		try {
			await this._conditionsRepository.save({ id, ...condition });
			return await this._conditionsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(`updateCondition ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteCondition(id: string) {
		try {
			await this._conditionsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteCondition ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteConditions(ids: string[]) {
		try {
			await this._conditionsRepository.delete(ids);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteConditions ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
