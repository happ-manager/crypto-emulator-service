export function chunkArray<T>(array: T[], numChunks: number): T[][] {
	const chunks: T[][] = [];
	const chunkSize = Math.ceil(array.length / numChunks);

	for (let i = 0; i < numChunks; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, array.length);
		if (start < end) {
			chunks.push(array.slice(start, end));
		}
	}

	return chunks;
}
