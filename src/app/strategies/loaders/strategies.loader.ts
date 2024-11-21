import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { StrategyEntity } from "../entities/strategy.entity";
import { StrategiesService } from "../services/strategies.service";

export interface IStrategiesLoader {
	getStrategiesByMilestone: DataLoader<string, StrategyEntity | null>;
	getStrategiesByTrading: DataLoader<string, StrategyEntity | null>;
}

@Injectable()
export class StrategiesLoader {
	constructor(private readonly _strategiesService: StrategiesService) {}

	createStrategiesLoaderByMilestones() {
		return new DataLoader<string, StrategyEntity | null>(async (milestoneIds: string[]) => {
			const { data } = await this._strategiesService.getStrategies({
				where: { milestones: { id: In(milestoneIds) } },
				relations: ["milestones"]
			});

			return milestoneIds.map((id) => data.find((strategy) => strategy.milestones.some((m) => m.id === id)) || null);
		});
	}

	createStrategiesLoaderByTradings() {
		return new DataLoader<string, StrategyEntity | null>(async (tradingsIds: string[]) => {
			const { data } = await this._strategiesService.getStrategies({
				where: { tradings: { id: In(tradingsIds) } },
				relations: ["tradings"]
			});

			return tradingsIds.map((id) => data.find((strategy) => strategy.tradings.some((c) => c.id === id)) || null);
		});
	}
}
