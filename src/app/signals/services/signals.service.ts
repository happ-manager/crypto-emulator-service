import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { SignalEntity } from "../entities/signal.entity";
import type { ISignal } from "../interfaces/signal.interface";

@Injectable()
export class SignalsService {
	constructor(
		@InjectRepository(SignalEntity) private readonly _signalsRepository: Repository<SignalEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	async getSignal(options?: FindOneOptions<SignalEntity>) {
		return this._signalsRepository.findOne(options);
	}

	async getSignals(options?: FindManyOptions<SignalEntity>) {
		const [data, count] = await this._signalsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createSignal(signal: DeepPartial<ISignal>) {
		try {
			const savedSignal = await this._signalsRepository.save(signal);
			const findedSignal = await this._signalsRepository.findOne({ where: { id: savedSignal.id } });

			this._eventsService.emit(EventsEnum.SIGNAL_CREATED, findedSignal);

			return findedSignal;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createSignals(signals: DeepPartial<ISignal>[]) {
		const existSignals = await this._signalsRepository.find({
			where: {
				tokenAddress: In(signals.map((signal) => signal.tokenAddress)),
				source: In([...new Set(signals.map((signal) => signal.source))])
			}
		});
		const existAddresses = new Set(existSignals.map((existSignal) => existSignal.tokenAddress));

		const signalsToCreate = signals.filter((signal) => !existAddresses.has(signal.tokenAddress));

		try {
			const savedSignals = await this._signalsRepository.save(signalsToCreate);
			const savedSignalsIds = savedSignals.map((savedSignal) => savedSignal.id);
			const findedSignals = await this._signalsRepository.find({ where: { id: In(savedSignalsIds) } });

			this._eventsService.emit(EventsEnum.SIGNALS_CREATED, findedSignals);

			return findedSignals;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateSignal(id: string, signal: DeepPartial<ISignal>) {
		try {
			await this._signalsRepository.save({ id, ...signal });
			return await this._signalsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteSignal(id: string) {
		try {
			await this._signalsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
