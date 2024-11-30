import type { IBase } from "../../shared/interfaces/base.interface";
import type { ITrading } from "../../trading/interfaces/trading.interface";
import type { IMilestone } from "./milestone.interface";

export interface IStrategy extends IBase {
	id: string;
	name: string;
	description?: string;
	milestones: IMilestone[];
	tradings: ITrading[];
}
