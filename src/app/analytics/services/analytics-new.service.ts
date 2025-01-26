import { ISignal, ITransaction, MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
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
import { createSharedTransactionBuffer } from "../utils/create-shared-transaction-buffer.util";
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
		this.redisClient = new Redis({
			host: "redis", // Хост вашего Redis-сервера
			port: 6379 // Порт вашего Redis-сервера
		});
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

		// Попробуем загрузить из кеша
		let signals = await this.getCachedLargeData("signals");
		if (!signals) {
			signals = await this._signalsService.getSignals({
				skip: props.signalsSkip,
				take: props.signalsTake
			});
			await this.cacheLargeData("signals", signals, 10_000); // Кешируем данные на 1 час
		}
		console.log(`${signals.length} signals loaded`);

		const transactions = await this.getCachedLargeData("transactions");
		if (!transactions) {
			const transactions = await this.getTransactions(signals);

			await this.cacheLargeData("transactions", transactions, 10_000); // Кешируем данные на 1 час
		}
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
		const signalsChunks = chunkArray(signals, 1000);
		const workerPromises = signalsChunks.map((_signals, index) =>
			runWorker("transactionsWorker.js", { index, signals: _signals })
		);

		const transactions = (await Promise.all(workerPromises)).flat();

		return transactions as ITransaction[];
	}

	private async getCachedLargeData(key: string): Promise<any[]> {
		const count = await this.redisClient.get(`${key}:count`);
		if (!count) {
			return null;
		}

		const data = [];
		const length = Number.parseInt(count, 10);
		for (let i = 0; i < length; i++) {
			console.log(`Loading ${i} from ${length} for ${key}`);
			const chunk = await this.redisClient.get(`${key}:${i}`);
			if (chunk) {
				data.push(...JSON.parse(chunk));
			}
		}

		console.log(`Loaded ${data.length} items from cache for key: ${key}`);
		return data;
	}

	private async cacheLargeData(key: string, data: any[], ttl: number): Promise<void> {
		const chunkSize = 100_000; // Количество записей в одном чанке
		const chunks = [];

		for (let i = 0; i < data.length; i += chunkSize) {
			chunks.push(data.slice(i, i + chunkSize));
		}

		for (const [i, chunk] of chunks.entries()) {
			await this.redisClient.set(`${key}:${i}`, JSON.stringify(chunk), "EX", ttl);
		}

		await this.redisClient.set(`${key}:count`, chunks.length, "EX", ttl);
		console.log(`Cached ${data.length} items in ${chunks.length} chunks for key: ${key}`);
	}

	clearCache() {
		this.redisClient.flushall();
	}
}
