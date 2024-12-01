import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { ConditionsGroupEntity } from "../entities/conditions-group.entity";
import { ConditionsGroupsService } from "../services/conditions-groups.service";

export interface IConditionsGroupsLoader {
	getConditionsGroupsByMilestones: DataLoader<string, ConditionsGroupEntity[]>;
}

@Injectable()
export class ConditionsGroupsLoader {
	constructor(private readonly _conditionsGroupsService: ConditionsGroupsService) {}

	createConditionsGroupsByMilestonesLoader() {
		return new DataLoader<string, ConditionsGroupEntity[]>(async (milestoneIds: string[]) => {
			const { data } = await this._conditionsGroupsService.getConditionsGroups({
				where: { milestone: { id: In(milestoneIds) } },
				relations: ["milestone"]
			});

			return milestoneIds.map((milestoneId) =>
				data.filter((conditionsGroup) => conditionsGroup.milestone?.id === milestoneId)
			);
		});
	}
}
