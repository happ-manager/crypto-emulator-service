import { Injectable } from "@nestjs/common";
import { API_URLS } from "@raydium-io/raydium-sdk-v2";
import axios from "axios";

import { LoggerService } from "../../logger";
import type {
	IRPriorityFeeResponse,
	IRSwapInfoResponse,
	IRSwapTransactionsParams,
	IRSwapTransactionsResponse
} from "../interfaces/raydium-api.interface";
import type { IRaydiumSwap } from "../interfaces/raydium-swap.interface";

@Injectable()
export class RaydiumApiService {
	constructor(private readonly _loggerService: LoggerService) {}

	async getPriorityFee() {
		try {
			const resposne = await axios.get<IRPriorityFeeResponse>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

			return resposne.data;
		} catch (error) {
			this._loggerService.error(error, "priorityFee");
		}
	}

	async getSwapInfo(raydiumSwap: IRaydiumSwap) {
		const { inputMint, outputMint, amount, slippage, txVersion } = raydiumSwap;

		try {
			const query = `inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippage * 100}&txVersion=${txVersion}`;

			const response = await axios.get<IRSwapInfoResponse>(`${API_URLS.SWAP_HOST}/compute/swap-base-in?${query}`);

			return response.data;
		} catch (error) {
			this._loggerService.error(error, "swapHost");
		}
	}

	async getSwapTransactions(data: IRSwapTransactionsParams) {
		try {
			const response = await axios.post<IRSwapTransactionsResponse>(
				`${API_URLS.SWAP_HOST}/transaction/swap-base-in`,
				data
			);

			return response.data;
		} catch (error) {
			this._loggerService.error(error, "getSwapTransactions");
		}
	}
}
