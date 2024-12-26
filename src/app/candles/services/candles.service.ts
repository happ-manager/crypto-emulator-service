import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { CandleEntity } from "../entities/candle.entity";
import type { ICandle } from "../interfaces/candle.interface";
import type { ITransaction } from "../interfaces/transaction.interface";

@Injectable()
export class CandlesService {
	private readonly _transactions: ITransaction[] = [];

	constructor(
		@InjectRepository(CandleEntity) private readonly _candlesRepository: Repository<CandleEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.TRANSACTIONS_CREATED)
	async onCreatedTransactions(transactions: ITransaction[]) {
		this._transactions.push(...transactions);
	}

	@Cron("*/5 * * * * *") // Это выражение cron для запуска каждые 10 секунд
	async handleTransactions() {
		if (this._transactions.length === 0) {
			return;
		}

		const transactions = this._transactions.splice(0, this._transactions.length);
		const candlesToCreate: DeepPartial<ICandle>[] = [];

		const groupedByPool: Record<string, ITransaction[]> = transactions.reduce(
			(pre, cur) => ({ ...pre, [cur.poolAddress]: [...(pre[cur.poolAddress] || []), cur] }),
			{}
		);

		for (const [poolAddress, poolTransactions] of Object.entries(groupedByPool)) {
			// Группируем транзакции по секундам
			const groupedByDate: Record<string, ITransaction[]> = poolTransactions.reduce(
				(pre, cur) => ({ ...pre, [cur.date.format()]: [...(pre[cur.date.format()] || []), cur] }),
				{}
			);

			for (const [_, dateTransactions] of Object.entries(groupedByDate)) {
				// Сортируем транзакции по дате
				dateTransactions.sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1));

				const [firstTransaction] = dateTransactions;
				const lastTransaction = dateTransactions.at(-1);

				const minPrice = dateTransactions
					.map((t) => t.price)
					.reduce((min, current) => (current.lt(min) ? current : min));

				const maxPrice = dateTransactions
					.map((t) => t.price)
					.reduce((max, current) => (current.gt(max) ? current : max));

				candlesToCreate.push({
					poolAddress,
					openDate: firstTransaction.date,
					openPrice: firstTransaction.price,
					closeDate: lastTransaction.date,
					closePrice: lastTransaction.price,
					minPrice,
					maxPrice,
					transactions: dateTransactions
				});
			}
		}

		await this.createCandles(candlesToCreate);
	}

	async getCandle(options?: FindOneOptions<CandleEntity>) {
		return this._candlesRepository.findOne(options);
	}

	async getCandles(options?: FindManyOptions<CandleEntity>) {
		const [data, count] = await this._candlesRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createCandle(candle: DeepPartial<ICandle>) {
		try {
			const savedCandle = await this._candlesRepository.save(candle);

			const findedCandle = await this._candlesRepository.findOne({ where: { id: savedCandle.id } });

			this._eventsService.emit(EventsEnum.CANDLE_CREATED, findedCandle, true);

			return findedCandle;
		} catch (error) {
			this._loggerService.error(error, "createCandle");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createCandles(candles: DeepPartial<ICandle>[]) {
		try {
			const savedCandles = await this._candlesRepository.save(candles);
			const savedIds = savedCandles.map((savedCandle) => savedCandle.id);

			const findedCandles = await this._candlesRepository.find({ where: { id: In(savedIds) } });

			this._eventsService.emit(EventsEnum.CANDLES_CREATED, findedCandles, true);

			return findedCandles;
		} catch (error) {
			this._loggerService.error(error, "createCandles");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateCandle(id: string, candle: DeepPartial<ICandle>) {
		try {
			await this._candlesRepository.save({ id, ...candle });

			const updatedCandle = await this._candlesRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.CANDLE_UPDATED, updatedCandle, true);

			return updatedCandle;
		} catch (error) {
			this._loggerService.error(error, "updateCandle");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteCandle(id: string) {
		try {
			await this._candlesRepository.delete(id);

			this._eventsService.emit(EventsEnum.CANDLE_DELETED, id, true);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteCandle");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
