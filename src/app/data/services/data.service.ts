import { Injectable } from "@nestjs/common";

import { DateService } from "../../libs/date";
import { SolscanService } from "../../libs/solscan";
import { getTradingsMap } from "../../libs/solscan/utils/get-tradings-map.util";
import type { ISignal } from "../../signals/interfaces/signal.interface";
import { SignalsService } from "../../signals/services/signals.service";
import type { ISolscanBody } from "../interfaces/solscan-body.interface";

@Injectable()
export class DataService {
	constructor(
		private readonly _dateService: DateService,
		private readonly _solscanService: SolscanService,
		private readonly _signalsService: SignalsService
	) {}

	async importFromSolscan(body: ISolscanBody) {
		const { tokenAddress, afterDate, cookie } = body;

		if (cookie) {
			this._solscanService.updateCookie(cookie);
		}

		const allBalanceChanges = await this._solscanService.getAllBalanceChanges(tokenAddress, afterDate);

		if (!allBalanceChanges) {
			return;
		}

		const signals: Partial<ISignal>[] = [];

		// Получаем торговые транзакции и фильтруем их с учетом skip и take
		const tradingsMap = getTradingsMap(allBalanceChanges);

		for (const tokenName in tradingsMap) {
			const tradings = tradingsMap[tokenName];

			const sortedTransactions = tradings.sort((a, b) => a.block_time - b.block_time);
			const enterTransaction = sortedTransactions.find((transaction) => transaction.change_type === "inc");

			if (!enterTransaction) {
				continue;
			}

			signals.push({
				signaledAt: this._dateService.unix(enterTransaction.block_time),
				source: tokenAddress,
				tokenAddress: enterTransaction.token_address
			});
		}

		return this._signalsService.createSignals(signals);
	}
}
