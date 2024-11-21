import type { ISignal } from "../../signals/interfaces/signal.interface";

export interface IAnalyticsBody {
	signals: ISignal[];
	sources: string[];
}
