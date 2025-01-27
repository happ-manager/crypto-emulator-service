interface RangeConfig {
	start: number;
	end: number;
	step: number;
}

type ParameterConfig = Record<string, RangeConfig>;

export function newGenerateSettings(params: ParameterConfig, workerIndex: number, totalWorkers: number): object[] {
	const keys = Object.keys(params);
	const ranges = keys.map((key) => {
		const { start, end, step } = params[key];
		const values = [];
		if (step === 0) {
			throw new Error(`Step cannot be zero for parameter: ${key}`);
		}
		if (start < end && step > 0) {
			for (let i = start; i <= end; i += step) {
				values.push(i);
			}
		} else if (start > end && step < 0) {
			for (let i = start; i >= end; i += step) {
				values.push(i);
			}
		} else {
			throw new Error(`Invalid range for parameter: ${key}`);
		}
		return values;
	});

	// Calculate total number of combinations
	const totalCombinations = ranges.reduce((acc, curr) => acc * curr.length, 1);

	// Calculate range for this worker
	const combinationsPerWorker = Math.ceil(totalCombinations / totalWorkers);
	const startIdx = workerIndex * combinationsPerWorker;
	const endIdx = Math.min(startIdx + combinationsPerWorker, totalCombinations);

	// Generate combinations for the current worker
	const cartesianValue = (index: number): number[] => {
		const result = [];
		for (const range of ranges) {
			result.push(range[index % range.length]);
			index = Math.floor(index / range.length);
		}
		return result;
	};

	const subset = [];
	for (let i = startIdx; i < endIdx; i++) {
		const values = cartesianValue(i);
		const config: Record<string, number> = {};
		for (const [index, key] of keys.entries()) {
			config[key] = values[index];
		}
		subset.push(config);
	}

	return subset;
}
