import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { lastValueFrom } from "rxjs";

import { LoggerService } from "../../logger";
import { COIN_MARKET_CAP } from "../constants/coin-market-cap.costant";
import { COIN_MARKET_CAP_CONFIG } from "../injection-tokens/coin-market-cap-config.injection-token";
import { ICoinMarketCapConfig } from "../interfaces/coin-market-cap-config.interface";
import type { IQuotesHistoricalProps } from "../interfaces/props.interface";
import type { ICoinInfoResponse, IQuoteHistoricalResponse } from "../interfaces/responses.inteface";

@Injectable()
export class CoinMarketCapService {
	private readonly _apiUrl = "https://pro-api.coinmarketcap.com/v2/cryptocurrency";

	constructor(
		@Inject(COIN_MARKET_CAP_CONFIG) private readonly coinMarketCapConfig: ICoinMarketCapConfig,
		private readonly _httpService: HttpService,
		private readonly _loggerService: LoggerService
	) {}

	private get _headers() {
		return {
			[COIN_MARKET_CAP.AUTH_HEADER]: this.coinMarketCapConfig.key
		};
	}

	async info(address: string) {
		try {
			const res$ = this._httpService.get(`${this._apiUrl}/info`, {
				params: { address },
				headers: this._headers
			});

			const res = await lastValueFrom<ICoinInfoResponse>(res$);

			return Object.values(res.data.data);
		} catch (error) {
			this._loggerService.error("info", error?.response?.data?.status);
			return null;
		}
	}

	async quotesHistorical(props: IQuotesHistoricalProps) {
		const { id, time_start, time_end, interval, count } = props;

		try {
			const res$ = this._httpService.get(`${this._apiUrl}/quotes/historical`, {
				params: { id, time_start, time_end, interval, count },
				headers: this._headers
			});
			const res = await lastValueFrom<IQuoteHistoricalResponse>(res$);

			return res.data.data;
		} catch (error) {
			this._loggerService.error("quotesHistorical", error?.response.data);
			return null;
		}
	}
}
