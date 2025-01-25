import { IClownStrategyParmas, type ISignal, ITransaction, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { IGenerateSettingsProps } from "../interfaces/generate-settings.interface";
import { generateSettings } from "../utils/generate-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService
	) {}

	async analyse(body?: IGenerateSettingsProps) {
		const { signalsSkip = 0, signalsTake = 5, startHour = 14, endHour = 20 } = body;

		const allSignals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		const filteredSignals = allSignals.filter((signal) => {
			const date = new Date(signal.signaledAt); // Преобразование в объект Date
			const hour = date.getUTCHours(); // Получение часов в формате UTC
			return hour >= startHour && hour < endHour; // Проверка попадания в интервал
		});

		console.log(`Started ${filteredSignals.length} signals`);

		const allSettings = generateSettings(body);

		const transactions = await this.getTransactions(filteredSignals);

		const transactionsMap = new Map<string, ITransaction[]>();

		for (const transaction of transactions) {
			if (transactionsMap.has(transaction.poolAddress)) {
				transactionsMap.get(transaction.poolAddress).push(transaction);
				continue;
			}

			transactionsMap.set(transaction.poolAddress, [transaction]);
		}

		console.log(`Strated ${allSettings.length} settings`);

		const checkedSignals = await this.getCheckedSignals(allSettings, filteredSignals, transactionsMap);

		const bestResult = checkedSignals.reduce((best, current) =>
			current.strategyResult?.totalProfit > best.strategyResult?.totalProfit ? current : best
		);

		await this.sendMessagesToTelegram(filteredSignals, allSettings, bestResult);

		console.log(bestResult);

		return bestResult;
	}

	async getTransactions(allSignals: ISignal[]) {
		const signalsChunks = chunkArray(allSignals, 500);
		const workerPromises = signalsChunks.map((signals) => runWorker("transactionsWorker.js", { signals }));

		const workersStart = Date.now();
		const transactions = (await Promise.all(workerPromises)).flat();

		console.log(`Get ${transactions.length} transactions in ${(Date.now() - workersStart) / 1000}`);
		return transactions as ITransaction[];
	}

	async getCheckedSignals(allSettings: IClownStrategyParmas[], signals: ISignal[], transactionsMap: any) {
		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});

		const settingsChunks = chunkArray(allSettings, 500);
		const workerPromises = settingsChunks.map((settings, index) =>
			runWorker("checkedSignalsWorker.js", { index, strategy, signals, settings, transactionsMap })
		);

		const workersStart = Date.now();
		const checkedSignales = (await Promise.all(workerPromises)).flat();
		console.log(`Checked ${checkedSignales.length} signals in ${(Date.now() - workersStart) / 1000}`);

		return checkedSignales;
	}

	async sendMessagesToTelegram(allSignals: ISignal[], allSettings: IClownStrategyParmas[], bestResult: any) {
		const text = `
*Лучшие параметры для ${allSignals.length} сигналов из ${allSettings.length}:*

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

		try {
			this._httpClient
				.post(`https://api.telegram.org/bot${environment.apiToken}/sendMessage`, {
					chat_id: 617_590_837,
					text
				})
				.subscribe();
		} catch {
			console.error("Error sending to telegram");
		}
	}
}
