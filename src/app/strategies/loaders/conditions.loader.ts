import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { In } from "typeorm";

import type { ConditionEntity } from "../entities/condition.entity";
import { ConditionsService } from "../services/conditions.service";

export interface IConditionsLoader {
	getConditionsByConditionsGroup: DataLoader<string, ConditionEntity[]>;
}

@Injectable()
export class ConditionsLoader {
	constructor(private readonly _conditionsService: ConditionsService) {}

	createConditionsByConditionsGroupsLoader() {
		return new DataLoader<string, ConditionEntity[]>(async (conditionsGroupIds: string[]) => {
			const { data } = await this._conditionsService.getConditions({
				where: { conditionsGroup: { id: In(conditionsGroupIds) } },
				relations: ["conditionsGroup"]
			});

			return conditionsGroupIds.map((conditionsGroupId) =>
				data.filter((condition) => condition.conditionsGroup?.id === conditionsGroupId)
			);
		});
	}
}
