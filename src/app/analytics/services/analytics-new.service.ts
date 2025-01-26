import {
	IClownStrategyParmas,
	type ISignal,
	ITransaction,
	MilestoneTypeEnum,
	PredefinedStrategyEnum
} from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { cpus } from "os";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { generateSettings } from "../utils/generate-settings.util";
import { runWorker } from "../utils/run-worker.util";

const MAX_WORKERS = cpus().length; // Количество воркеров, можно адаптировать под доступные ресурсы.

@Injectable()
export class AnalyticsNewService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _signalsService: SignalsService,
		private readonly _strategiesService: StrategiesService
	) {}

	async analyse(props: GenerateSettingsDto) {
		const { investment = 1000, delay = 1000, signalsTake = 5, signalsSkip = 0 } = props;
		const settings = generateSettings(props); // Генерация всех настроек
		const signals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});

		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

		if (!signalMilestone) {
			console.log("У стратегии должен быть сигнал");
			return;
		}

		const settingsChunks = chunkArray(settings, Math.ceil(settings.length / MAX_WORKERS));

		console.log({
			settings: settings.length,
			signals: signals.length,
			settingsChunks: settingsChunks.length
		});

		const getDate = Date.now();
		const transactions = await this.getTransactions(signals);

		console.log(`Get ${transactions.length} transactions in ${(Date.now() - getDate) / 1000}`);

		const setDate = Date.now();
		const transactionsMap = new Map<string, ITransaction[]>();
		for (const transaction of transactions) {
			if (transactionsMap.has(transaction.poolAddress)) {
				transactionsMap.get(transaction.poolAddress).push(transaction);
				continue;
			}

			transactionsMap.set(transaction.poolAddress, [transaction]);
		}

		console.log(`Set ${transactions.length} transactions in ${(Date.now() - setDate) / 1000}`);

		let bestSettingResult = { totalProfit: 0 };
		let bestSetting = null;

		const workerPromises = settingsChunks.map((_settings, index) =>
			runWorker("analyticsWorker.js", {
				index,
				settings: _settings,
				signals,
				transactionsMap,
				strategy,
				signalMilestone,
				investment,
				delay
			})
		);

		const settingsDate = new Date();
		const results = await Promise.all(workerPromises);

		console.log(`Get ${results.length} result in ${(Date.now() - settingsDate) / 1000}`);

		for (const { settingResult, setting } of results) {
			if (settingResult.totalProfit > bestSettingResult.totalProfit) {
				bestSettingResult = settingResult;
				bestSetting = setting;
			}
		}

		console.log({ bestSettingResult, bestSetting });

		await this.sendMessagesToTelegram(signals, settings, bestSettingResult, bestSetting);

		return { bestSettingResult, bestSetting };
	}

	async getTransactions(signals: ISignal[]) {
		const signalsChunks = chunkArray(signals, Math.ceil(signals.length / MAX_WORKERS));
		const workerPromises = signalsChunks.map((_signals, index) =>
			runWorker("transactionsWorker.js", { index, signals: _signals })
		);

		const transactions = (await Promise.all(workerPromises)).flat();

		return transactions as ITransaction[];
	}

	async sendMessagesToTelegram(
		allSignals: ISignal[],
		allSettings: IClownStrategyParmas[],
		bestSettingResult: any,
		bestSetting: any
	) {
		const text = `
*Лучшие параметры для ${allSignals.length} сигналов из ${allSettings.length}:*

*Параметры настройки:*
- 🛒 *buyPercent*: ${bestSetting.buyPercent}
- 📈 *sellHighPercent*: ${bestSetting.sellHighPercent}
- 📉 *sellLowPercent*: ${bestSetting.sellLowPercent}
- ⏳ *minTime*: ${bestSetting.minTime}
- ⏱ *maxTime*: ${bestSetting.maxTime}
- ⏱ *maxTime*: ${bestSetting.maxTime}
- ⏱ *maxTime*: ${bestSetting.maxTime}

*Результаты стратегии:*
- ✅ *Win Count*: ${bestSettingResult.winCount}
- ❌ *Lose Count*: ${bestSettingResult.loseCount}
- 🤷‍♂️ *Ignore Count*: ${bestSettingResult.ignoreCount}
- 🔥 *Win Series*: ${bestSettingResult.winSeries}
- 💔 *Lose Series*: ${bestSettingResult.loseSeries}
- 💵 *Total Enter*: ${bestSettingResult.totalEnter.toFixed(2)}
- 💰 *Total Profit*: ${bestSettingResult.totalProfit.toFixed(2)}
- 🏦 *Total Exit*: ${bestSettingResult.totalExit.toFixed(2)}
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
