import { getCheckedTransaction, MilestoneTypeEnum, percentOf } from "@happ-manager/crypto-api";
import { DataSource } from "typeorm";
import { parentPort, workerData } from "worker_threads";

import { DATA_ENTITIES } from "../app/data/entities";
import { getDelayedTransaction } from "../app/emulator/utils/get-delayed-transaction.util";
import { findTransaction } from "../app/shared/utils/find-transaction.util";
import { environment } from "../environments/environment";

async function processAnalytics() {
	const { index, settings, signals, transactionsMap, strategy, signalMilestone, investment, delay } = workerData;

	const date = Date.now();
	console.log(`Analytics worker ${index + 1} started`);

	const datasource = new DataSource({
		type: "postgres",
		host: environment.database.host,
		port: environment.database.port,
		username: environment.database.username,
		password: environment.database.password,
		database: environment.database.name,
		entities: [...DATA_ENTITIES],
		synchronize: false
	});

	await datasource.initialize();

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

	console.log(`Analytics worker ${index + 1} finished in ${(Date.now() - date) / 1000}`);

	parentPort.postMessage({ settingResult: bestSettingResult, setting: bestSetting });
}

processAnalytics().catch((error) => {
	parentPort?.postMessage({ error: error.message });
});
