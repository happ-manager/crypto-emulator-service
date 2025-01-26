import { ISignal, MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { chunkArray } from "@raydium-io/raydium-sdk";
import Redis from "ioredis";
import { cpus } from "os";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { createSharedSignalBuffer } from "../utils/create-shared-signal-buffer.util";
import { generateWorkerSettings } from "../utils/generate-worker-settings.util";
import { runWorker } from "../utils/run-worker.util";

@Injectable()
export class AnalyticsNewService {
	private readonly redisClient: Redis;

	constructor(
		private readonly _httpClient: HttpService,
		private readonly _strategiesService: StrategiesService,
		private readonly _signalsService: SignalsService
	) {
		this.redisClient = new Redis(environment.redis);
	}

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
			take: props.signalsTake
		});
		const { buffer: signalsBuffer, stringData: signalsData, length: signalsLength } = createSharedSignalBuffer(signals);
		console.log(`${signals.length} signals loaded`);

		const {
			combinedData: transactionsData,
			combinedBuffer: transactionsBuffer,
			totalLength: transactionsLength
		} = await this.getTransactions(signals);

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

		await this.sendMessagesToTelegram(signals, bestSettingResult, bestSetting);

		return { bestSettingResult, bestSetting };
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

	async getTransactions(signals: ISignal[]) {
		const signalsChunks = chunkArray(signals, Math.ceil(signals.length / cpus().length));

		// Запуск воркеров
		const workerPromises = signalsChunks.map((_signals, index) =>
			runWorker("transactionsWorker.js", { index, signals: _signals })
		);

		console.log("Start getting transactions");
		// Ждем выполнения всех воркеров
		const workerResults = await Promise.all(workerPromises);

		console.log("Start combining");

		// Вычисляем общий размер буфера
		const totalLength = workerResults.reduce((sum, { length }) => sum + length, 0);

		// Создаем общий SharedArrayBuffer
		const combinedBuffer = new SharedArrayBuffer(totalLength * 8);
		const combinedView = new DataView(combinedBuffer);

		// Объединяем данные из всех воркеров
		let offset = 0;
		for (const { buffer, length } of workerResults) {
			if (length * 8 > buffer.byteLength) {
				throw new Error(`Buffer length mismatch: expected ${length * 8}, got ${buffer.byteLength}`);
			}

			const view = new DataView(buffer);
			for (let i = 0; i < length; i++) {
				if (offset >= totalLength) {
					throw new RangeError(`Offset (${offset}) exceeds total buffer size (${totalLength}).`);
				}
				combinedView.setFloat64(offset * 8, view.getFloat64(i * 8));
				offset++;
			}
		}
		g;

		// Объединение transactionsData
		const combinedData = workerResults.reduce((acc, { stringData }) => {
			// Убедитесь, что stringData — это объект
			if (typeof stringData === "string") {
				stringData = JSON.parse(stringData); // Преобразуем в объект, если это строка
			}
			for (const key in stringData) {
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key] = [...acc[key], ...stringData[key]];
			}
			return acc;
		}, {});

		console.log("Return combined data");

		// Возвращаем объединенные данные
		return { combinedBuffer, combinedData, totalLength };
	}
}
