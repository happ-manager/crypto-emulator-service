import { join } from "path";
import { Worker } from "worker_threads";

export function runWorker(data: any): Promise<any> {
	return new Promise((resolve, reject) => {
		const worker = new Worker(join(__dirname, "analyticsWorker.js"), { workerData: data });

		worker.on("message", resolve);
		worker.on("error", reject);
		worker.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		});
	});
}
