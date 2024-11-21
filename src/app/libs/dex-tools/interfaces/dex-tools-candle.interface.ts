import type { IToDate } from "../../date/interfaces/to-date.interface";

export type IDexToolCandle = IToDate<Candle, "ts" | "firstTimestamp" | "lastTimestamp" | "time">;

export interface IDexToolsCandleEntity {
	name: string;
	data: IDexToolCandle[];
}

interface Candle {
	_id: number;
	ts: number;
	firstBlock: number;
	firstIndex: number;
	firstTimestamp: number;
	lastBlock: number;
	lastIndex: number;
	lastTimestamp: number;
	sellsNumber: number;
	sellsVolume: number;
	buysNumber: number;
	buysVolume: number;
	time: number;
	open: number;
	close: number;
	high: number;
	low: number;
	volume: number;
}
