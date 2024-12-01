import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { MilestoneEntity } from "../entities/milestone.entity";
import { MilestonesService } from "../services/milestones.service";

export interface IMilestonesLoader {
	getMilestonesByStrategies: DataLoader<string, MilestoneEntity[]>;
}

@Injectable()
export class MilestonesLoader {
	constructor(private readonly _milestonesService: MilestonesService) {}

	createMilestonesByStrategiesLoader() {
		return new DataLoader<string, MilestoneEntity[]>(async (strategyIds: string[]) => {
			const { data } = await this._milestonesService.getMilestones({
				where: { strategy: { id: In(strategyIds) } },
				relations: ["strategy"]
			});

			return strategyIds.map((strategyId) => data.filter((milestone) => milestone.strategy?.id === strategyId));
		});
	}
}
