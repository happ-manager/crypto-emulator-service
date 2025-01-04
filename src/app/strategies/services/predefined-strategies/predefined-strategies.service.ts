import { Injectable } from "@nestjs/common";

import { PredefinedStrategyEnum } from "../../enums/predefined-strategy.enum";
import type { IMilestoneProps } from "../../interfaces/milestone.interface";
import { ImpulseStrategyService } from "./impulse-strategy.service";

@Injectable()
export class PredefinedStrategiesService {
	constructor(private readonly _impulseStrategyService: ImpulseStrategyService) {}

	getCheckedMilestone(props: IMilestoneProps) {
		if (props.strategy.predefinedStrategy === PredefinedStrategyEnum.IMPULSE) {
			return this._impulseStrategyService.getCheckedMilestone(props);
		}
	}
}
