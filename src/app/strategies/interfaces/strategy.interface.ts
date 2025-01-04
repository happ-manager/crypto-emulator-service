import type { IBase } from "../../shared/interfaces/base.interface";
import type { ITrading } from "../../trading/interfaces/trading.interface";
import type { PredefinedStrategyEnum } from "../enums/predefined-strategy.enum";
import type { IMilestone } from "./milestone.interface";

export interface IStrategy extends IBase {
	id: string;
	name: string;
	description?: string;
	predefinedStrategy?: PredefinedStrategyEnum;
	milestones: IMilestone[];
	tradings: ITrading[];
}
