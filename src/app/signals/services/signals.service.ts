import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { sleep } from "../../shared/utils/sleep.util";
import { ITradingToken } from "../../trading/interfaces/trading-token.interface";
import { SignalEntity } from "../entities/signal.entity";
import type { ISignal } from "../interfaces/signal.interface";

@Injectable()
export class SignalsService {
	constructor(
		@InjectRepository(SignalEntity) private readonly _signalsRepository: Repository<SignalEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.TRADING_TOKENS_CREATED)
	async onTradingTokensCreate(tradingTokens: ITradingToken[]) {
		await sleep(5000);

		const signalsToCreate: DeepPartial<ISignal>[] = tradingTokens.map((tradingToken) => ({
			source: tradingToken.walletAddress,
			signaledAt: tradingToken.signaledAt,
			poolAddress: tradingToken.poolAddress
		}));

		await this.createSignals(signalsToCreate);
	}

	@OnEvent(EventsEnum.TRADING_TOKEN_CREATED)
	async onTradingTokenCreate(tradingToken: ITradingToken) {
		await sleep(5000);

		await this.createSignal({
			source: tradingToken.walletAddress,
			signaledAt: tradingToken.signaledAt,
			poolAddress: tradingToken.poolAddress
		});
	}

	async getSignal(options?: FindOneOptions<ISignal>) {
		return this._signalsRepository.findOne(options);
	}

	async getSignals(options?: FindManyOptions<ISignal>) {
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
			const findedSignal = await this._signalsRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.SIGNAL_UPDATED, findedSignal);

			return findedSignal;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteSignal(id: string) {
		try {
			await this._signalsRepository.delete(id);

			this._eventsService.emit(EventsEnum.SIGNAL_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
