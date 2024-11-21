import type { ICoinInfo } from "./coin-info.interface";
import type { IQuote } from "./quote.interface";

export interface ICoinMarketCapResponse<T> {
	data: {
		data: T;
	};
}

export type ICoinInfoResponse = ICoinMarketCapResponse<Record<string, ICoinInfo>>;

export type IQuoteHistoricalResponse = ICoinMarketCapResponse<{
	id: string;
	name: string;
	symbol: string;
	is_active: 0 | 1;
	is_fiat: 0 | 1;
	quotes: IQuote[];
}>;
