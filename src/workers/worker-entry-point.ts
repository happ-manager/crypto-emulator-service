import { parentPort } from "worker_threads";

import { getCheckedSignals } from "../app/analytics/utils/get-checked-signals.util";
import { getStrategyResults } from "../app/analytics/utils/get-strategy-results.util";

export async function processWorkerTasks() {
	parentPort?.on("message", async (workerData) => {
		const { strategy, signals, settings, transactionsMap } = workerData;

		const results = [];
		for (const setting of settings) {
			const checkedSignalsChunk = getCheckedSignals(strategy, signals, setting, transactionsMap);
			const strategyResult = getStrategyResults(checkedSignalsChunk);

			results.push({ setting, strategyResult });
		}

		parentPort?.postMessage(results);
	});
}

export default processWorkerTasks;
