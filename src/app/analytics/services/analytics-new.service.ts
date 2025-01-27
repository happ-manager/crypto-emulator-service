import { ISignal, MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { cpus } from "os";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { createSharedSignalBuffer } from "../utils/create-shared-signal-buffer.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsNewService {
	constructor(
		private readonly _httpClient: HttpService,
		private readonly _strategiesService: StrategiesService,
		private readonly _signalsService: SignalsService
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

		console.log("STARTED");

		const signals = await this._signalsService.getSignals({
			skip: props.signalsSkip,
			take: props.signalsTake,
			select: ["poolAddress", "signaledAt"]
		});
		const { buffer: signalsBuffer, stringData: signalsData, length: signalsLength } = createSharedSignalBuffer(signals);
		console.log(`${signals.length} signals loaded`);

		const {
			combinedBuffer: transactionsBuffer,
			combinedPoolAddresses: transactionsData,
			totalLength: transactionsLength
		} = await this.getTransactions(signals);

		const settingsParams = {
			buyPercent: { start: props.buyPercentStart, end: props.buyPercentEnd, step: props.buyPercentStep },
			sellHighPercent: { start: props.sellHighStart, end: props.sellHighEnd, step: props.sellHighStep },
			sellLowPercent: { start: props.sellLowStart, end: props.sellLowEnd, step: props.sellLowStep },
			minTime: { start: props.minTimeStart, end: props.minTimeEnd, step: props.minTimeStep },
			maxTime: { start: props.maxTimeStart, end: props.maxTimeEnd, step: props.maxTimeStep }
		};

		const workersCount = Math.min(cpus().length, props.maxWorkers);
		const workerPromises = new Array(workersCount).fill(null).map((_, index) =>
			runWorker("analyticsWorker.js", {
				index,
				props,
				workersCount,
				settingsParams,
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

		await this.sendMessagesToTelegram(signals, bestSettingResult, bestSetting);

		return { bestSettingResult, bestSetting };
	}

	async getTransactions(signals: ISignal[]) {
		console.log("Starting getTransactions...");
		const signalsChunks = chunkArray(signals, Math.min(cpus().length, 100));
		// console.log(
		// 	"Signals chunks created:",
		// 	signalsChunks.map((chunk) => chunk.length)
		// );

		const workerPromises = signalsChunks.map((chunk, index) =>
			runWorker("transactionsWorker.js", { index, signals: chunk })
		);

		console.log("Starting workers...");
		const workerResults = await Promise.all(workerPromises);

		// console.log(
		// 	"Worker results summary:",
		// 	workerResults.map(({ length }) => length)
		// );

		const totalLength = workerResults.reduce((sum, { length }) => sum + length, 0);
		console.log("Total transactions length:", totalLength);

		const combinedBuffer = new SharedArrayBuffer(totalLength * 8 * 3);
		const combinedView = new DataView(combinedBuffer);

		let offset = 0;
		let combinedPoolAddresses: string[] = [];

		for (const { buffer, stringData, length } of workerResults) {
			// console.log(`Processing worker result: Length=${length}`);
			const view = new DataView(buffer);

			// Используем concat вместо spread для объединения массивов
			// eslint-disable-next-line unicorn/prefer-spread
			combinedPoolAddresses = combinedPoolAddresses.concat(stringData);

			// Объединение данных в общий буфер
			for (let i = 0; i < length * 3; i++) {
				if (offset >= totalLength * 3) {
					throw new RangeError(`Offset (${offset}) exceeds total buffer size (${totalLength * 3}).`);
				}
				combinedView.setFloat64(offset * 8, view.getFloat64(i * 8));
				offset++;
			}
		}

		console.log("Combining completed. Total offset:", offset);

		if (offset !== totalLength * 3) {
			throw new Error(`Combined buffer length mismatch: expected ${totalLength * 3}, got ${offset}`);
		}

		console.log("Return combined data");
		return { combinedBuffer, combinedPoolAddresses, totalLength };
	}

	async sendMessagesToTelegram(signals: any, bestSettingResult: any, bestSetting: any) {
		const text = `
*Лучшие параметры для ${signals.length} сигналов:*

*Параметры настройки:*
- 🛒 *buyPercent*: ${bestSetting.buyPercent}
- 📈 *sellHighPercent*: ${bestSetting.sellHighPercent}
- 📉 *sellLowPercent*: ${bestSetting.sellLowPercent}
- ⏳ *minTime*: ${bestSetting.minTime}
- ⏱ *maxTime*: ${bestSetting.maxTime}
- 🕒 *Start Hour*: ${bestSetting.startHour}
- 🕔 *End Hour*: ${bestSetting.endHour}
- ⌛ *Delay*: ${bestSetting.delay}
- 💵 *Investment*: ${bestSetting.investment}

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
					text,
					parse_mode: "Markdown"
				})
				.subscribe();
		} catch {
			console.error("Error sending to telegram");
		}
	}
}
