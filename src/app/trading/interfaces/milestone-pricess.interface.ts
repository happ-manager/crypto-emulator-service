import type { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IMilestone } from "../../strategies/interfaces/milestone.interface";
import type { ITrading } from "./trading.interface";
import type { ITradingToken } from "./trading-token.interface";

export interface IMilestoneProcess {
	milestone: IChecked<IMilestone>;
	trading: ITrading;
	tradingToken: ITradingToken;
}
