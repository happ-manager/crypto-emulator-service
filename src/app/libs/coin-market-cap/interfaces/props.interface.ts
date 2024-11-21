import type { IInterval } from "./interval.interface";

export interface IQuotesHistoricalProps {
	id: string;
	symbol?: string;
	time_start?: string;
	time_end?: string;
	count?: number;
	interval?: IInterval;
	convert?: string;
	convert_id?: string;
	aux?: string;
	skip_invalid?: boolean;
}
