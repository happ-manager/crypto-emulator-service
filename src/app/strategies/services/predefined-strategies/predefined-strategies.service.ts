import { Injectable } from "@nestjs/common";

import { PredefinedStrategyEnum } from "../../enums/predefined-strategy.enum";
import type { ICheckedProps } from "../../interfaces/milestone.interface";
import { ImpulseStrategyService } from "./impulse-strategy.service";

@Injectable()
export class PredefinedStrategiesService {
	constructor(private readonly _impulseStrategyService: ImpulseStrategyService) {}

	getCheckedTransaction(props: ICheckedProps) {
		if (props.strategy.predefinedStrategy === PredefinedStrategyEnum.IMPULSE) {
			return this._impulseStrategyService.getCheckedTransaction(props);
		}
	}
}
