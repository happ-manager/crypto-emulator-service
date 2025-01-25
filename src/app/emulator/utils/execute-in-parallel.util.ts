export async function executeInParallel<T>(tasks: (() => Promise<T>)[], parallelLimit: number): Promise<T[]> {
	const results: T[] = [];
	const executing: Promise<void>[] = [];

	for (const [_, task] of tasks.entries()) {
		// Обертываем выполнение задачи для логирования
		const promise = (async () => {
			const result = await task(); // Выполняем задачу
			results.push(result); // Сохраняем результат
		})();

		// Добавляем задачу в список выполняющихся
		executing.push(promise);

		if (executing.length >= parallelLimit) {
			// Дожидаемся завершения одной из выполняющихся задач
			await Promise.race(executing);
		}

		// Убираем завершенные задачи из списка
		// Это делается только после их завершения
		executing.filter((p) => p !== promise);
	}

	// Дожидаемся выполнения всех оставшихся задач
	await Promise.all(executing);
	return results;
}
