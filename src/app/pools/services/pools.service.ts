import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { EventsEnum } from "../../shared/enums/events.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { PoolEntity } from "../entities/pool.entity";
import type { IPool } from "../interfaces/pool.interface";

@Injectable()
export class PoolsService {
	private readonly _loggerService = new Logger("PoolsService");

	constructor(
		@InjectRepository(PoolEntity) private readonly _poolsRepository: Repository<PoolEntity>,
		private readonly _eventsService: EventEmitter2
	) {}

	async getPool(options?: FindOneOptions<IPool>) {
		return this._poolsRepository.findOne(options);
	}

	async getPools(options?: FindManyOptions<IPool>) {
		const [data, count] = await this._poolsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createPool(pool: DeepPartial<IPool>) {
		try {
			const savedPool = await this._poolsRepository.save(pool);

			const findedPool = await this._poolsRepository.findOne({ where: { id: savedPool.id } });

			this._eventsService.emit(EventsEnum.POOL_CREATED, findedPool);

			return findedPool;
		} catch (error) {
			this._loggerService.error(error, "createPool");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updatePool(id: string, pool: DeepPartial<IPool>) {
		try {
			await this._poolsRepository.save({ id, ...pool });
			const findedPool = await this._poolsRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.POOL_UPDATED, findedPool);

			return findedPool;
		} catch (error) {
			this._loggerService.error(error, "updatePool");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deletePool(id: string) {
		try {
			await this._poolsRepository.delete(id);

			this._eventsService.emit(EventsEnum.POOL_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deletePool");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
