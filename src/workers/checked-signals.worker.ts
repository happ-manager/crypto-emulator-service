import { parentPort, workerData } from "worker_threads";

import { getCheckedSignals } from "../app/analytics/utils/get-checked-signals.util";
import { getStrategyResults } from "../app/analytics/utils/get-strategy-results.util";

async function processAnalytics() {
	const { strategy, signals, settings, transactionsMap } = workerData;

	const results = [];

	for (const setting of settings) {
		const checkedSignalsChunk = getCheckedSignals(strategy, signals, setting, transactionsMap);

		const strategyResult = getStrategyResults(checkedSignalsChunk);

		results.push({ setting, strategyResult });
	}

	parentPort?.postMessage(results);
}

processAnalytics().catch((error) => {
	parentPort?.postMessage({ error: error.message });
});
