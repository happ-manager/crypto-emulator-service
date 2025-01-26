import type { IBaseTransaction, ISignal } from "@happ-manager/crypto-api";
import { getCheckedTransaction, MilestoneTypeEnum, percentOf } from "@happ-manager/crypto-api";
import { parentPort, workerData } from "worker_threads";

import { generateSettings } from "../app/analytics/utils/generate-settings.util";
import { getDelayedTransaction } from "../app/emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../app/shared/utils/find-transaction.util";

async function processAnalytics() {
	if (!workerData) {
		return;
	}

	const {
		index,
		strategy,
		signalMilestone,
		workerSettings,
		signalsBuffer,
		signalsData,
		signalsLength,
		transactionsBuffer,
		transactionsLength,
		transactionsData
	} = workerData;

	const date = Date.now();
	console.log(`Analytics worker ${index + 1} started`);

	// Восстанавливаем числовые данные транзакций
	const sharedTransactions = new Float64Array(transactionsBuffer);

	if (sharedTransactions.length < transactionsLength * 3) {
		throw new Error(
			`Shared transactions buffer is too small: expected ${transactionsLength * 3}, got ${sharedTransactions.length}`
		);
	}

	const transactionsMap = new Map<string, IBaseTransaction[]>();

	for (let i = 0; i < transactionsLength; i++) {
		const offset = i * 3;
		const poolAddress = transactionsData[sharedTransactions[offset + 2]]; // Индекс poolAddress
		const transaction: any = {
			date: new Date(sharedTransactions[offset]), // Дата
			price: sharedTransactions[offset + 1] // Цена
		};

		if (transactionsMap.has(poolAddress)) {
			transactionsMap.get(poolAddress).push(transaction);
		} else {
			transactionsMap.set(poolAddress, [transaction]);
		}
	}

	console.log(`Analytics worker ${index + 1} loaded transactions`);

	// Восстанавливаем сигналы из буфера
	const sharedSignals = new Float64Array(signalsBuffer);
	const signals: ISignal[] = [];

	for (let i = 0; i < signalsLength; i++) {
		signals.push({
			id: signalsData["id"][i],
			source: signalsData["source"][i],
			tokenAddress: signalsData["tokenAddress"][i],
			poolAddress: signalsData["poolAddress"][i],
			signaledAt: new Date(sharedSignals[i]) // Восстанавливаем дату
		} as any);
	}

	console.log(`Analytics worker ${index + 1} loaded signals`);

	const settings = generateSettings(workerSettings);

	console.log(`Analytics worker ${index + 1} loaded ${settings.length} settings`);

	let bestSettingResult = { totalProfit: 0 };
	let bestSetting = null;

	for (const setting of settings) {
		const filteredSignals = signals.filter((signal) => {
			const date = new Date(signal.signaledAt); // Преобразование в объект Date
			const hour = date.getUTCHours(); // Получение часов в формате UTC
			return hour >= setting.startHour && hour < setting.endHour; // Проверка попадания в интервал
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
			const signalTransaction = findTransaction(transactions, new Date(signal.signaledAt));

			if (!signalTransaction) {
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

				const delayedTransaction = getDelayedTransaction(transactions, checkedTransaction, workerSettings.delay);

				checkedTransactions.set(milestone.id, delayedTransaction);
				checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
			}

			let { investment } = workerSettings;

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
			bestSetting = setting;
		}
	}

	console.log(`Analytics worker ${index + 1} finished in ${(Date.now() - date) / 1000} seconds`);

	parentPort.postMessage({ settingResult: bestSettingResult, setting: bestSetting });
}

processAnalytics().catch((error) => {
	console.error(error);
	parentPort?.postMessage({ error: error.message });
});
