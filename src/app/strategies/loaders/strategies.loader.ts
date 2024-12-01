import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { StrategyEntity } from "../entities/strategy.entity";
import { StrategiesService } from "../services/strategies.service";

export interface IStrategiesLoader {
	getStrategiesByMilestones: DataLoader<string, StrategyEntity | null>;
	getStrategiesByTradings: DataLoader<string, StrategyEntity | null>;
}

@Injectable()
export class StrategiesLoader {
	constructor(private readonly _strategiesService: StrategiesService) {}

	createStrategiesByMilestonesLoader() {
		return new DataLoader<string, StrategyEntity | null>(async (milestoneIds: string[]) => {
			const { data } = await this._strategiesService.getStrategies({
				where: { milestones: { id: In(milestoneIds) } },
				relations: ["milestones"]
			});

			return milestoneIds.map(
				(milestoneId) =>
					data.find((strategy) => strategy.milestones.some((milestone) => milestone.id === milestoneId)) || null
			);
		});
	}

	createStrategiesByTradingsLoader() {
		return new DataLoader<string, StrategyEntity | null>(async (tradingsIds: string[]) => {
			const { data } = await this._strategiesService.getStrategies({
				where: { tradings: { id: In(tradingsIds) } },
				relations: ["tradings"]
			});

			return tradingsIds.map(
				(tradingId) => data.find((strategy) => strategy.tradings.some((trading) => trading.id === tradingId)) || null
			);
		});
	}
}
