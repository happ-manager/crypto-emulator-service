import type { ILoaders } from "../../../loaders/interfaces/loaders.interface";

export interface IGqlContext {
	req: any;
	loaders: ILoaders;
}
