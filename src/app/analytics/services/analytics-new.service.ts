import { ISignal, MilestoneTypeEnum, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { cpus } from "os";
import { Worker } from "worker_threads";

import { environment } from "../../../environments/environment";
import { SignalsService } from "../../data/services/signals.service";
import { StrategiesService } from "../../data/services/strategies.service";
import { chunkArray } from "../../emulator/utils/chunk-array.util";
import { GenerateSettingsDto } from "../dtos/generate-settings.dto";
import { createSharedSignalBuffer } from "../utils/create-shared-signal-buffer.util";
import { generateWorkerSettings } from "../utils/generate-worker-settings.util";
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
		console.log("Starting getTransactions...");

		// Разделяем сигналы на чанки по количеству CPU
		const signalsChunks = chunkArray(signals, cpus().length);

		// console.log(
		// 	"Signals chunks created:",
		// 	signalsChunks.map((chunk) => chunk.length)
		// );

		// Запускаем воркеры для обработки транзакций
		const workerPromises = signalsChunks.map((chunk, index) =>
			runWorker("transactionsWorker.js", { index, signals: chunk })
		);

		console.log("Starting workers...");
		const workerResults = await Promise.all(workerPromises);

		console.log("Worker results summary:");
		// for (const [index, { length, stringData }] of workerResults.entries()) {
		// 	console.log(`Worker ${index + 1}:`);
		// 	console.log(`  Transactions length: ${length}`);
		// 	console.log(`  Example poolAddresses: ${stringData.slice(0, 5).join(", ")}`);
		// }

		// Проверяем, что каждый воркер вернул валидные данные
		for (const [index, { buffer, stringData, length }] of workerResults.entries()) {
			if (!buffer || !stringData || typeof length !== "number") {
				throw new Error(`Worker ${index + 1} returned invalid data.`);
			}
			if (length === 0) {
				console.warn(`Warning: Worker ${index + 1} returned no transactions.`);
			}
		}

		console.log("All worker results validated.");

		// Вычисляем общий размер буфера
		const totalLength = workerResults.reduce((sum, { length }) => sum + length, 0);
		// console.log("Total transactions to combine:", totalLength);

		// Создаем общий буфер для всех транзакций
		const combinedBuffer = new SharedArrayBuffer(totalLength * 8 * 3);
		const combinedView = new DataView(combinedBuffer);

		// Объединяем данные
		let offset = 0;
		const combinedPoolAddresses: string[] = [];

		for (const { buffer, stringData, length } of workerResults) {
			// console.log("Combining data from worker:");
			// console.log(`  Length: ${length}`);
			// console.log(`  Buffer size: ${buffer.byteLength}`);
			// console.log(`  Example poolAddresses: ${stringData.slice(0, 5).join(", ")}`);

			// Проверка соответствия длины буфера
			if (length * 3 * 8 > buffer.byteLength) {
				throw new Error(`Buffer length mismatch: expected ${length * 3 * 8}, got ${buffer.byteLength}`);
			}

			combinedPoolAddresses.push(...stringData);

			const view = new DataView(buffer);
			for (let i = 0; i < length * 3; i++) {
				if (offset >= totalLength * 3) {
					throw new RangeError(`Offset (${offset}) exceeds total buffer size (${totalLength * 3}).`);
				}
				combinedView.setFloat64(offset * 8, view.getFloat64(i * 8));
				offset++;
			}
		}

		// Проверяем, что все данные были объединены
		if (offset !== totalLength * 3) {
			throw new Error(
				`Combined buffer length mismatch: expected ${totalLength * 3}, but got ${offset}. Possible data loss.`
			);
		}

		console.log("Combined data validated.");
		// console.log("Final combined poolAddresses count:", combinedPoolAddresses.length);

		// Проверка, что все poolAddress присутствуют
		const examplePoolAddress = signals[0]?.poolAddress;
		if (examplePoolAddress && !combinedPoolAddresses.includes(examplePoolAddress)) {
			console.error(`Critical: Missing poolAddress ${examplePoolAddress} in combined data.`);
		}

		console.log("getTransactions completed successfully.");

		return { combinedBuffer, combinedPoolAddresses, totalLength };
	}
}
