import { MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { cpus } from "os";
import { In } from "typeorm";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { TransactionsService } from "../../data/services/transactions.service";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { createSharedSignalBuffer } from "../utils/create-shared-signal-buffer.util";
import { createSharedTransactionBuffer } from "../utils/create-shared-transaction-buffer.util";
import { generateWorkerSettings } from "../utils/generate-worker-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsNewService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _strategiesService: StrategiesService,
		private readonly _signalsService: SignalsService,
		private readonly _transactionsService: TransactionsService
	) {}

	async analyse(props: GenerateSettingsDto) {
		const strategy = await this._strategiesService.getStrategy({
			where: { predefinedStrategy: PredefinedStrategyEnum.CLOWN },
			relations: ["milestones"]
		});
		const signalMilestone = strategy.milestones.find((milestone) => milestone.type === MilestoneTypeEnum.SIGNAL);

		if (!signalMilestone) {
			console.log("У стратегии должен быть сигнал");
			return;
		}

		const signals = await this._signalsService.getSignals({
			skip: props.signalsSkip,
			take: props.signalsTake
		});

		console.log(`${signals.length} signals loaded`);

		const transactions = await this._transactionsService.getTransactions({
			where: {
				poolAddress: In(signals.map((signal) => signal.poolAddress))
			}
		});

		console.log(`${transactions.length} transactions loaded`);

		const { buffer: signalsBuffer, stringData: signalsData, length: signalsLength } = createSharedSignalBuffer(signals);
		const {
			buffer: transactionsBuffer,
			stringData: transactionsData,
			length: transactionsLength
		} = createSharedTransactionBuffer(transactions);

		const workerSettings = generateWorkerSettings(props, cpus().length);
		const workerPromises = workerSettings.map((workerSettings, index) =>
			runWorker("analyticsWorker.js", {
				index,
				workerSettings,
				strategy,
				signalMilestone,
				signalsBuffer,
				signalsData,
				signalsLength,
				transactionsBuffer,
				transactionsData,
				transactionsLength
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

		console.log({
			bestSettingResult,
			bestSetting
		});

		await this.sendMessagesToTelegram(bestSettingResult, bestSetting);

		return { bestSettingResult, bestSetting };
	}

	async sendMessagesToTelegram(bestSettingResult: any, bestSetting: any) {
		const text = `
*Лучшие параметры:*

*Параметры настройки:*
- 🛒 *buyPercent*: ${bestSetting.buyPercent}
- 📈 *sellHighPercent*: ${bestSetting.sellHighPercent}
- 📉 *sellLowPercent*: ${bestSetting.sellLowPercent}
- ⏳ *minTime*: ${bestSetting.minTime}
- ⏱ *maxTime*: ${bestSetting.maxTime}
- ⏱ *startHour*: ${bestSetting.startHour}
- ⏱ *endHour*: ${bestSetting.endHour}

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
