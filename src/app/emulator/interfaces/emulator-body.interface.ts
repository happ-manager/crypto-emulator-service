import type { ISignal, IStrategy } from "@happ-manager/crypto-api";

export interface IEmulateBody {
	signals: ISignal[];
	strategies: IStrategy[];
	delay: number;
}
