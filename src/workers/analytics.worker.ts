import type { ISignal, ITransaction } from "@happ-manager/crypto-api";
import { sleep } from "@happ-manager/crypto-api";
import { getCheckedTransaction, MilestoneTypeEnum, percentOf } from "@happ-manager/crypto-api";
import { parentPort, workerData } from "worker_threads";

import { generateTimeIntervals } from "../app/analytics/utils/generate-time-intervals.util";
import { newGenerateSettings } from "../app/analytics/utils/new-generate-settings.util";
import { getDelayedTransaction } from "../app/emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../app/shared/utils/find-transaction.util";

async function processAnalytics(data?: any) {
	if (!workerData && !data) {
		return;
	}

	const {
		index,
		strategy,
		props,
		signalMilestone,
		workersCount,
		settingsParams,
		signalsBuffer,
		signalsData,
		signalsLength,
		transactionsBuffer,
		transactionsLength,
		transactionsData
	} = workerData || data;

	await sleep(index * 30_000);

	const date = Date.now();
	console.log(`Analytics worker ${index + 1} started`);

	const sharedTransactions = new Float64Array(transactionsBuffer);
	// console.log("Shared transactions buffer length:", sharedTransactions.length);
	// console.log("Transactions length expected:", transactionsLength)
	//
	// ;

	if (sharedTransactions.length < transactionsLength * 3) {
		throw new Error(
			`Shared transactions buffer is too small: expected ${transactionsLength * 3}, got ${sharedTransactions.length}`
		);
	}

	// Формирование transactionsMap
	const transactionsMap = new Map<string, ITransaction[]>();
	for (let i = 0; i < transactionsLength; i++) {
		const offset = i * 3;
		const poolAddress = transactionsData[i];
		const transaction: ITransaction = {
			poolAddress,
			date: new Date(sharedTransactions[offset]),
			price: sharedTransactions[offset + 1]
		} as any;

		if (!transactionsMap.has(poolAddress)) {
			transactionsMap.set(poolAddress, []);
		}
		transactionsMap.get(poolAddress).push(transaction);
	}

	console.log(`Analytics worker ${index + 1} transactions set`);

	// Проверяем сигналы
	const sharedSignals = new Float64Array(signalsBuffer);
	const signals: ISignal[] = [];

	console.log(`Analytics worker ${index + 1} signals set`);

	// Проверяем, что signalsData имеет правильную структуру
	if (!signalsData || !Array.isArray(signalsData["poolAddress"])) {
		throw new Error("Invalid signalsData structure: Missing 'poolAddress'");
	}

	for (let i = 0; i < signalsLength; i++) {
		signals.push({
			poolAddress: signalsData["poolAddress"][i], // Доступ через ключ "poolAddress"
			signaledAt: new Date(sharedSignals[i]) // Преобразование UNIX timestamp в Date
		} as ISignal);
	}

	// console.log(`Signals`, signals);

	// console.log(`Analytics worker ${index + 1} finished signals and transactions processing.`);

	const settings = newGenerateSettings(settingsParams, index, workersCount);
	console.log(`Analytics worker ${index + 1} loaded ${settings.length} settings`);
	const timeIntervals = generateTimeIntervals(props.hourRangeStart, props.hourRangeEnd, props.hourRangeStep);
	console.log(`Analytics worker ${index + 1} loaded ${timeIntervals.length} time intervals`);

	let bestSettingResult = { totalProfit: 0 };
	let bestSetting = {};

	for (const [startHour, endHour] of timeIntervals) {
		for (const setting of settings) {
			const filteredSignals = signals.filter((signal) => {
				const date = new Date(signal.signaledAt); // Преобразование в объект Date
				const hour = date.getUTCHours(); // Получение часов в формате UTC
				return hour >= startHour && hour < endHour; // Проверка попадания в интервал
			});

			let winStreak = 0;
			let loseStreak = 0;

			const settingResult = {
				winCount: 0,
				loseCount: 0,
				ignoreCount: 0,
				winSeries: 0,
				loseSeries: 0,
				totalEnter: 0,
				totalProfit: 0,
				totalExit: 0
			};

			for (const signal of filteredSignals) {
				const transactions = transactionsMap.get(signal.poolAddress);

				if (!transactions) {
					console.error(`Cannot find transactions for ${signal.poolAddress}`);
					return;
				}

				const signalTransaction = findTransaction(transactions, new Date(signal.signaledAt));

				if (!signalTransaction) {
					console.log(`Cannot find signal transaction`);
					continue;
				}

				const checkedTransactions = new Map();
				checkedTransactions.set(signalMilestone.id, signalTransaction);

				const checkedMilestones = [];
				const sortedMilestones = strategy.milestones.sort((a, b) => a.position - b.position);

				for (const milestone of sortedMilestones) {
					const checkedTransaction = getCheckedTransaction({
						strategy,
						milestone,
						transactions,
						checkedTransactions,
						settings: setting
					});

					if (!checkedTransaction) {
						continue;
					}

					const delayedTransaction = getDelayedTransaction(transactions, checkedTransaction, props.delay);

					checkedTransactions.set(milestone.id, delayedTransaction);
					checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
				}

				let { investment } = props;
				let tokenBalance = 0;
				let totalEnter = 0;
				let totalExit = 0;

				for (const checkedMilestone of checkedMilestones) {
					const milestoneValue = Number.parseFloat(checkedMilestone.value || "0");
					const tokenPrice = checkedMilestone.delayedTransaction.price;

					if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
						const enterPrice = percentOf(investment, milestoneValue);
						const tokens = enterPrice / tokenPrice;

						totalEnter += tokens * tokenPrice;
						investment -= enterPrice;
						tokenBalance += tokens;
						checkedMilestone["enterPrice"] = enterPrice;
					}

					if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
						const tokens = percentOf(tokenBalance, milestoneValue);
						const exitPrice = tokens * tokenPrice;

						totalExit += exitPrice;
						investment += exitPrice;
						tokenBalance -= tokens;
						checkedMilestone["exitPrice"] = exitPrice;
					}
				}

				const profit = totalExit - totalEnter;

				settingResult.totalEnter += totalEnter;
				settingResult.totalExit += totalExit;
				settingResult.totalProfit += profit;

				if (totalEnter === 0) {
					settingResult.ignoreCount++;
				} else if (profit >= 0) {
					settingResult.winCount++;
					settingResult.loseSeries = 0;

					if (++winStreak > settingResult.winSeries) {
						settingResult.winSeries = winStreak;
					}
				} else if (profit < 0) {
					settingResult.loseCount++;
					settingResult.winSeries = 0;

					if (++loseStreak > settingResult.loseSeries) {
						settingResult.loseSeries = loseStreak;
					}
				}
			}

			if (settingResult.totalProfit > bestSettingResult.totalProfit) {
				bestSettingResult = settingResult;
				bestSetting = {
					...setting,
					delay: props.delay,
					investment: props.investment,
					startHour,
					endHour
				};
			}
		}
	}

	console.log(`Analytics worker ${index + 1} finished in ${(Date.now() - date) / 1000} seconds`);

	parentPort.postMessage({ settingResult: bestSettingResult, setting: bestSetting });
	return { settingResult: bestSettingResult, setting: bestSetting };
}

// processAnalytics().catch((error) => {
// 	console.error(error);
// 	parentPort?.postMessage({ error: error.message });
// });

export default processAnalytics;
