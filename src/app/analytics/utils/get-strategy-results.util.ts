import { MilestoneTypeEnum, percentOf } from "@happ-manager/crypto-api";

import type { ICheckedSignal } from "../interfaces/checked-signal.interface";

const INVESTMENT = 100;

export function getStrategyResults(checkedSignals: ICheckedSignal[]) {
	const strategyResult = {
		winCount: 0,
		loseCount: 0,
		ignoreCount: 0,
		winSeries: 0,
		loseSeries: 0,
		totalEnter: 0,
		totalProfit: 0,
		totalExit: 0
	};

	let winStreak = 0;
	let loseStreak = 0;

	for (const checkedSignal of checkedSignals) {
		let investment = INVESTMENT;
		let tokenBalance = 0;
		let totalEnter = 0;
		let totalExit = 0;

		for (const checkedMilestone of checkedSignal.checkedMilestones) {
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

		checkedSignal["enterPrice"] = totalEnter;
		checkedSignal["exitPrice"] = totalExit;
		const profit = totalExit - totalEnter;

		strategyResult.totalEnter += totalEnter;
		strategyResult.totalExit += totalExit;
		strategyResult.totalProfit += profit;

		if (totalEnter === 0) {
			strategyResult.ignoreCount++;
		} else if (profit >= 0) {
			strategyResult.winCount++;
			strategyResult.loseSeries = 0;

			if (++winStreak > strategyResult.winSeries) {
				strategyResult.winSeries = winStreak;
			}
		} else if (profit < 0) {
			strategyResult.loseCount++;
			strategyResult.winSeries = 0;

			if (++loseStreak > strategyResult.loseSeries) {
				strategyResult.loseSeries = loseStreak;
			}
		}
	}

	return strategyResult;
}
