import { MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { cpus } from "os";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { StrategiesService } from "../../data/services/strategies.service";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { generateWorkerSettings } from "../utils/generate-worker-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsNewService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _strategiesService: StrategiesService
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

		const workerSettings = generateWorkerSettings(props, cpus().length);

		const workerPromises = workerSettings.map((workerSettings, index) =>
			runWorker("analyticsWorker.js", { index, workerSettings, strategy, signalMilestone })
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
