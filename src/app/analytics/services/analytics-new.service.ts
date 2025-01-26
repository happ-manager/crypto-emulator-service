import {
	IClownStrategyParmas,
	type ISignal,
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
import { createSharedSettingsBuffer } from "../utils/create-shared-settings-buffer.util";
import { createSharedSignalBuffer } from "../utils/create-shared-signal-buffer.util";
import { createSharedTransactionBuffer } from "../utils/create-shared-transaction-buffer.util";
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
		const signals = await this._signalsService.getSignals({
			skip: signalsSkip,
			take: signalsTake
		});
		console.log(`Get ${signals.length} signals`);

		const { buffer: signalsBuffer, stringData: signalsData } = createSharedSignalBuffer(signals);
		const signalsChunks = chunkArray(signals, 500);
		const transactionsPromises = signalsChunks.map((_signals, index) =>
			runWorker("transactionsWorker.js", { index, signalsBuffer, signalsData, signalsLength: signals.length })
		);

		console.log(`Get transactions started`);
		const transactionsDate = Date.now();
		const transactions = (await Promise.all(transactionsPromises)).flat();
		console.log(`Get ${transactions.length} transactions in ${(Date.now() - transactionsDate) / 1000} seconds`);
		const { buffer: transactionsBuffer, stringData: transactionsData } = createSharedTransactionBuffer(transactions);

		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});
		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

		if (!signalMilestone) {
			console.log("У стратегии должен быть сигнал");
			return;
		}

		const settingsDate = Date.now();
		const settings = generateSettings(props);
		console.log(`Get ${settings.length} settings in ${(Date.now() - settingsDate) / 1000} seconds`);

		const { buffer: settingsBuffer, length: settingsLength } = createSharedSettingsBuffer(settings);
		const settingsChunks = chunkArray([...new Array(settingsLength).keys()], Math.ceil(settingsLength / MAX_WORKERS));

		const workerPromises = settingsChunks.map((settingIndexes, index) =>
			runWorker("analyticsWorker.js", {
				index,
				settingsBuffer,
				settingsIndexes: settingIndexes,
				transactionsBuffer,
				transactionsData,
				transactionsLength: transactions.length,
				signalsBuffer,
				signalsData,
				signalsLength: signals.length,
				strategy,
				signalMilestone,
				investment,
				delay
			})
		);

		console.log(`Get results started`);
		const resultsDate = Date.now();
		const results = await Promise.all(workerPromises);
		console.log(`Get ${results.length} results in ${(Date.now() - resultsDate) / 1000} seconds`);

		let bestSettingResult = { totalProfit: 0 };
		let bestSetting = null;

		for (const { settingResult, setting } of results) {
			if (settingResult.totalProfit > bestSettingResult.totalProfit) {
				bestSettingResult = settingResult;
				bestSetting = setting;
			}
		}

		await this.sendMessagesToTelegram(signals, settings, bestSettingResult, bestSetting);

		console.log({ bestSettingResult, bestSetting });

		return { bestSettingResult, bestSetting };
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
