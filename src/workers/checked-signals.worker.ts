import { parentPort, workerData } from "worker_threads";

import { getCheckedSignals } from "../app/analytics/utils/get-checked-signals.util";
import { getStrategyResults } from "../app/analytics/utils/get-strategy-results.util";

async function processAnalytics() {
	const { strategy, signals, settings, transactionsMap } = workerData;

	let bestResult = { strategyResult: { totalProfit: 0 }, setting: settings[0] };

	for (const setting of settings) {
		const checkedSignalsChunk = getCheckedSignals(strategy, signals, setting, transactionsMap);

		const strategyResult = getStrategyResults(checkedSignalsChunk);

		if (strategyResult.totalProfit > bestResult.strategyResult.totalProfit) {
			bestResult = { strategyResult, setting };
		}
	}

	parentPort?.postMessage(bestResult);
}

processAnalytics().catch((error) => {
	parentPort?.postMessage({ error: error.message });
});
