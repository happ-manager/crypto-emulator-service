import { parentPort, workerData } from "worker_threads";

import { getCheckedSignals } from "../app/analytics/utils/get-checked-signals.util";
import { getStrategyResults } from "../app/analytics/utils/get-strategy-results.util";

async function processSettings() {
	const workerStartDate = Date.now();
	const { index, strategy, signals, settings, transactionsMap } = workerData;

	const results = [];

	for (const setting of settings) {
		const checkedSignalsChunk = getCheckedSignals(strategy, signals, setting, transactionsMap);

		const strategyResult = getStrategyResults(checkedSignalsChunk);

		results.push({ setting, strategyResult });
	}

	console.log(`Worker #${index + 1} finish in ${(Date.now() - workerStartDate) / 1000}`);

	parentPort?.postMessage(results);
}

processSettings().catch((error) => {
	parentPort?.postMessage({ error: error.message });
});
