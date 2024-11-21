import type { FindManyOptions } from "typeorm";

export function getPage(options: FindManyOptions) {
	if (!options.skip || !options.take) {
		return 1;
	}

	return options.skip / options.take + 1;
}
