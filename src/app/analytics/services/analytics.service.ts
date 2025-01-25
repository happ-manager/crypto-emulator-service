import { type ISignal, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { TransactionEntity } from "../../data/entities/transaction.entity";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { TransactionsService } from "../../data/services/transactions.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";
import { generateSettings } from "../utils/generate-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService,
		private readonly _transactionsService: TransactionsService
	) {}

	async analyse(body?: IGenerateSettingsProps) {
		const { signalsSkip = 0, signalsTake = 5, startHour = 14, endHour = 20 } = body;

		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});
		const allSignals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		const signals = allSignals.filter((signal) => {
			const date = new Date(signal.signaledAt); // Преобразование в объект Date
			const hour = date.getUTCHours(); // Получение часов в формате UTC
			return hour >= startHour && hour < endHour; // Проверка попадания в интервал
		});

		const allSettings = generateSettings(body);
		const settingsChunks = chunkArray(allSettings, 500);

		const getTransactionDate = Date.now();

		const transactionsMap = await this.getTransactions(signals);
		const workerPromises = settingsChunks.map((settings, index) =>
			runWorker({ index, strategy, signals, settings, transactionsMap })
		);
		console.log(
			`Settings length: ${allSettings.length}. \nSignals length: ${signals.length} \nGet transactions in ${(Date.now() - getTransactionDate) / 1000}`
		);

		const workersStart = Date.now();

		const results = (await Promise.all(workerPromises)).flat();

		console.log(`Results length: ${results.length} in ${(Date.now() - workersStart) / 1000}`);

		const bestResult = results.reduce((best, current) =>
			current.strategyResult?.totalProfit > best.strategyResult?.totalProfit ? current : best
		);

		const text = `
*Лучшие параметры для ${signals.length} сигналов из ${allSettings.length} параметров:*

*Параметры настройки:*
- 🛒 *buyPercent*: ${bestResult.setting.buyPercent}
- 📈 *sellHighPercent*: ${bestResult.setting.sellHighPercent}
- 📉 *sellLowPercent*: ${bestResult.setting.sellLowPercent}
- ⏳ *minTime*: ${bestResult.setting.minTime}
- ⏱ *maxTime*: ${bestResult.setting.maxTime}

*Результаты стратегии:*
- ✅ *Win Count*: ${bestResult.strategyResult.winCount}
- ❌ *Lose Count*: ${bestResult.strategyResult.loseCount}
- 🤷‍♂️ *Ignore Count*: ${bestResult.strategyResult.ignoreCount}
- 🔥 *Win Series*: ${bestResult.strategyResult.winSeries}
- 💔 *Lose Series*: ${bestResult.strategyResult.loseSeries}
- 💵 *Total Enter*: ${bestResult.strategyResult.totalEnter.toFixed(2)}
- 💰 *Total Profit*: ${bestResult.strategyResult.totalProfit.toFixed(2)}
- 🏦 *Total Exit*: ${bestResult.strategyResult.totalExit.toFixed(2)}
`;

		this._httpClient
			.post(`https://api.telegram.org/bot${environment.apiToken}/sendMessage`, {
				chat_id: 617_590_837,
				text
			})
			.subscribe();

		return bestResult;
	}

	async getTransactions(signals: ISignal[]) {
		const poolAddresses = signals.map((signal) => signal.poolAddress);
		const allTransactions = await this._transactionsService.getTransactions({
			where: { poolAddress: In(poolAddresses) }
		});
		const transactionsMap = new Map<string, TransactionEntity[]>();

		for (const transaction of allTransactions) {
			if (!transactionsMap.has(transaction.poolAddress)) {
				transactionsMap.set(transaction.poolAddress, [transaction]);
				continue;
			}

			transactionsMap.get(transaction.poolAddress).push(transaction);
		}

		return transactionsMap;
	}
}
