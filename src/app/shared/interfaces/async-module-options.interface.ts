import type { ModuleMetadata } from "@nestjs/common";

/**
 * Интерфейс для асинхронной конфигурации модуля.
 */
export interface AsyncModuleOptions<T> extends Pick<ModuleMetadata, "imports"> {
	inject?: any[];
	useFactory: (...args: any[]) => Promise<T>;
}
