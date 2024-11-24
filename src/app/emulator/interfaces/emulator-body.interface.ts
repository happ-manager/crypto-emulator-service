import type { ISignal } from "../../signals/interfaces/signal.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";

export interface IEmulateBody {
	signals: ISignal[];
	sources: string[];
	strategies: IStrategy[];
	investment: number;
	delay: number;
}
