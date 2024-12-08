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
	readonly relations = [
		"milestones",
		"milestones.refMilestone",
		"milestones.conditionsGroups",
		"milestones.conditionsGroups.refMilestone",
		"milestones.conditionsGroups.refConditionsGroup",
		"milestones.conditionsGroups.conditions",
		"milestones.conditionsGroups.conditions.refMilestone",
		"milestones.conditionsGroups.conditions.refConditionsGroup"
	];

	constructor(
		@InjectRepository(StrategyEntity)
		private readonly _strategiesRepository: Repository<StrategyEntity>,
		private readonly _eventsService: EventsService,
		private readonly _milestonesService: MilestonesService,
		private readonly _loggerService: LoggerService
	) {}

	async recreateStrategy(strategy: DeepPartial<IStrategy>) {
		const { data } = await this._milestonesService.getMilestones({
			where: { strategy: { id: strategy.id } }
		});

		const milestonesToDeleteIds = data.map((milestone) => milestone.id);

		if (milestonesToDeleteIds.length > 0) {
			await this._milestonesService.deleteMilestones(milestonesToDeleteIds);
		}

		const savedStrategy = await this._strategiesRepository.save(strategy);

		const milestonesToCreate = strategy.milestones.map((milestone: IMilestone) => ({
			...milestone,
			strategy: { id: savedStrategy.id }
		}));

		await this._milestonesService.recreateMilestones(milestonesToCreate);

		return savedStrategy;
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
			const savedStrategy = await this._strategiesRepository.save(strategy);
			const foundStrategy = await this._strategiesRepository.findOne({ where: { id: savedStrategy.id } });

			this._eventsService.emit(EventsEnum.STRATEGY_CREATED, foundStrategy);

			return foundStrategy;
		} catch (error) {
			this._loggerService.error(error, "createStrategy");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createStrategies(strategies: DeepPartial<IStrategy[]>) {
		try {
			const savedStrategies = await this._strategiesRepository.save(strategies);
			const savedStrategiesIds = savedStrategies.map((strategy) => strategy.id);
			const foundStrategies = await this._strategiesRepository.find({
				where: { id: In(savedStrategiesIds) }
			});

			this._eventsService.emit(EventsEnum.STRATEGIES_CREATED, foundStrategies);

			return foundStrategies;
		} catch (error) {
			this._loggerService.error(error, "createStrategies");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateStrategy(id: string, strategy: DeepPartial<IStrategy>) {
		try {
			const savedStrategy = await this._strategiesRepository.save({ id, ...strategy });
			const foundStrategy = await this._strategiesRepository.findOne({ where: { id: savedStrategy.id } });

			this._eventsService.emit(EventsEnum.STRATEGY_UPDATED, foundStrategy);

			return foundStrategy;
		} catch (error) {
			this._loggerService.error(error, "updateStrategy");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteStrategy(id: string) {
		try {
			await this._strategiesRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteStrategy");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
