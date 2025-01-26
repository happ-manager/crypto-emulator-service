import type { IClownStrategyParmas, ISignal, ITransaction } from "@happ-manager/crypto-api";
import { getCheckedTransaction, MilestoneTypeEnum, percentOf } from "@happ-manager/crypto-api";
import { parentPort, workerData } from "worker_threads";

import { getDelayedTransaction } from "../app/emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../app/shared/utils/find-transaction.util";

async function processAnalytics() {
	const {
		index,
		settingsBuffer,
		settingsIndexes,
		transactionsBuffer,
		transactionsLength,
		transactionsData,
		signalsBuffer,
		signalsData,
		signalsLength,
		strategy,
		signalMilestone,
		investment,
		delay
	} = workerData;
	const date = Date.now();
	console.log(`Analytics worker ${index + 1} started`);

	// Восстанавливаем settings из буфера
	const sharedSettings = new Float64Array(settingsBuffer);
	const settings: (IClownStrategyParmas & { startHour: number; endHour: number })[] = [];

	for (const settingIndex of settingsIndexes) {
		const offset = settingIndex * 7;
		settings.push({
			maxTime: sharedSettings[offset],
			minTime: sharedSettings[offset + 1],
			buyPercent: sharedSettings[offset + 2],
			sellHighPercent: sharedSettings[offset + 3],
			sellLowPercent: sharedSettings[offset + 4],
			startHour: sharedSettings[offset + 5],
			endHour: sharedSettings[offset + 6]
		});
	}

	// Восстанавливаем массив числовых данных
	const sharedTransactions = new Float64Array(transactionsBuffer);
	const transactionsMap = new Map<string, ITransaction[]>();

	for (let i = 0; i < transactionsLength; i++) {
		const offset = i * 5;
		const poolAddress = transactionsData["poolAddress"][i];
		const transaction: any = {
			id: transactionsData["id"][i],
			poolAddress,
			signature: transactionsData["signature"][i],
			author: transactionsData["author"][i],
			date: new Date(sharedTransactions[offset]), // Восстанавливаем дату
			price: sharedTransactions[offset + 1],
			nextPrice: sharedTransactions[offset + 2]
		};

		if (transactionsMap.has(poolAddress)) {
			transactionsMap.get(poolAddress).push(transaction);
		} else {
			transactionsMap.set(poolAddress, [transaction]);
		}
	}

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

				const delayedTransaction = getDelayedTransaction(transactions, checkedTransaction, delay);

				checkedTransactions.set(milestone.id, delayedTransaction);
				checkedMilestones.push({ ...milestone, checkedTransaction, delayedTransaction });
			}

			let signalInvestment = investment;

			let tokenBalance = 0;
			let totalEnter = 0;
			let totalExit = 0;

			for (const checkedMilestone of checkedMilestones) {
				const milestoneValue = Number.parseFloat(checkedMilestone.value || "0");
				const tokenPrice = checkedMilestone.delayedTransaction.price;

				if (checkedMilestone.type === MilestoneTypeEnum.BUY) {
					const enterPrice = percentOf(signalInvestment, milestoneValue);
					const tokens = enterPrice / tokenPrice;

					totalEnter += tokens * tokenPrice;
					signalInvestment -= enterPrice;
					tokenBalance += tokens;
					checkedMilestone["enterPrice"] = enterPrice;
				}

				if (checkedMilestone.type === MilestoneTypeEnum.SELL) {
					const tokens = percentOf(tokenBalance, milestoneValue);
					const exitPrice = tokens * tokenPrice;

					totalExit += exitPrice;
					signalInvestment += exitPrice;
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
	parentPort?.postMessage({ error: error.message });
});
