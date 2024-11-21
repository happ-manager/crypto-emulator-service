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
import { StrategyEntity } from "../entities/strategy.entity";
import type { IMilestone } from "../interfaces/milestone.interface";
import type { IStrategy } from "../interfaces/strategy.interface";
import { MilestonesService } from "./milestones.service";

@Injectable()
export class StrategiesService {
	constructor(
		@InjectRepository(StrategyEntity)
		private readonly _strategiesRepository: Repository<StrategyEntity>,
		private readonly _eventsService: EventsService,
		private readonly _milestonesService: MilestonesService,
		private readonly _loggerService: LoggerService
	) {}

	private async getStrategyWithMilestones(strategy: DeepPartial<IStrategy>) {
		if (strategy.id) {
			const { data } = await this._milestonesService.getMilestones({
				where: { strategy: { id: strategy.id } }
			});

			const milestonesToDeleteIds = data.map((milestone) => milestone.id);

			if (milestonesToDeleteIds.length > 0) {
				await this._milestonesService.deleteMilestones(milestonesToDeleteIds);
			}
		}

		const milestonesToCreate = (strategy.milestones || []).map((milestone: IMilestone) => ({
			...milestone,
			strategy: { id: strategy.id }
		}));
		const milestones = await this._milestonesService.createMilestones(milestonesToCreate);

		return { ...strategy, milestones };
	}

	async getStrategy(options?: FindOneOptions<StrategyEntity>) {
		return this._strategiesRepository.findOne(options);
	}

	async getStrategies(options?: FindManyOptions<StrategyEntity>) {
		const [data, count] = await this._strategiesRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createStrategy(strategy: DeepPartial<IStrategy>) {
		try {
			const strategyWithMilestones = await this.getStrategyWithMilestones(strategy);
			const savedStrategy = await this._strategiesRepository.save(strategyWithMilestones);
			const foundStrategy = await this._strategiesRepository.findOne({ where: { id: savedStrategy.id } });

			this._eventsService.emit(EventsEnum.STRATEGY_CREATED, foundStrategy);

			return foundStrategy;
		} catch (error) {
			this._loggerService.error(`createStrategy ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createStrategies(strategies: DeepPartial<IStrategy[]>) {
		try {
			const processedStrategies = await Promise.all(
				strategies.map((strategy: IStrategy) => this.getStrategyWithMilestones(strategy))
			);
			const savedStrategies = await this._strategiesRepository.save(processedStrategies);
			const savedStrategiesIds = savedStrategies.map((strategy) => strategy.id);
			const foundStrategies = await this._strategiesRepository.find({
				where: { id: In(savedStrategiesIds) }
			});

			this._eventsService.emit(EventsEnum.STRATEGIES_CREATED, foundStrategies);

			return foundStrategies;
		} catch (error) {
			this._loggerService.error(`createStrategies ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateStrategy(id: string, strategy: DeepPartial<IStrategy>) {
		try {
			const strategyWithMilestones = await this.getStrategyWithMilestones({ id, ...strategy });
			const savedStrategy = await this._strategiesRepository.save({ id, ...strategyWithMilestones });
			const foundStrategy = await this._strategiesRepository.findOne({ where: { id: savedStrategy.id } });

			this._eventsService.emit(EventsEnum.STRATEGY_UPDATED, foundStrategy);

			return foundStrategy;
		} catch (error) {
			this._loggerService.error(`updateStrategy ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteStrategy(id: string) {
		const milestones = await this._milestonesService.getMilestones({
			where: { strategy: { id } }
		});
		const milestonesIds = milestones.data.map((milestone) => milestone.id);

		await this._milestonesService.deleteMilestones(milestonesIds);

		try {
			await this._strategiesRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(`deleteStrategy ${error}`);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
