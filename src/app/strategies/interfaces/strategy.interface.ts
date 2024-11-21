import type { ITrading } from "../../trading/interfaces/trading.interface";
import type { IMilestone } from "./milestone.interface";

export interface IStrategy {
	id: string;
	name: string;
	milestones: IMilestone[];
	tradings: ITrading[];
}
