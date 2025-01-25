import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";

import { StrategyEntity } from "../entities/strategy.entity";

@Injectable()
export class StrategiesService {
	readonly strategiesRelations = [
		"milestones",
		"milestones.refMilestone",
		"milestones.conditionsGroups",
		"milestones.conditionsGroups.refMilestone",
		"milestones.conditionsGroups.refConditionsGroup",
		"milestones.conditionsGroups.conditions",
		"milestones.conditionsGroups.conditions.refMilestone",
		"milestones.conditionsGroups.conditions.refConditionsGroup"
	];

	constructor(@InjectRepository(StrategyEntity) private readonly _strategiesRepository: Repository<StrategyEntity>) {}

	async getStrategy(options?: FindOneOptions<StrategyEntity>) {
		return this._strategiesRepository.findOne(options);
	}

	async getStrategies(options?: FindManyOptions<StrategyEntity>) {
		return this._strategiesRepository.find(options);
	}
}
