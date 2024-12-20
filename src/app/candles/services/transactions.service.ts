import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { ISolanaInTransaction } from "../../libs/solana/interfaces/solana-transaction.interface";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { TransactionEntity } from "../entities/transaction.entity";
import type { ITransaction } from "../interfaces/transaction.interface";

@Injectable()
export class TransactionsService {
	private readonly _solanaTransactions: ISolanaInTransaction[] = [];

	constructor(
		@InjectRepository(TransactionEntity) private readonly _transactionsRepository: Repository<TransactionEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	@OnEvent(EventsEnum.SOLANA_TRANSACTION)
	async onSolanaTransaction(solanaTransaction: ISolanaInTransaction) {
		this._solanaTransactions.push(solanaTransaction);
	}

	@Cron("*/5 * * * * *") // Это выражение cron для запуска каждые 5 секунд
	async handleSolanaTransactions() {
		if (this._solanaTransactions.length === 0) {
			return;
		}

		const solanaTransactions = this._solanaTransactions.splice(0, this._solanaTransactions.length);
		const transactionsToCreate: DeepPartial<ITransaction>[] = solanaTransactions.map((solanaTransaction) => ({
			price: solanaTransaction.price?.toString(),
			date: solanaTransaction.date,
			poolAddress: solanaTransaction.poolAddress,
			signature: solanaTransaction.message.params.result.signature
		}));

		await this.createTransactions(transactionsToCreate);
	}

	async getTransaction(options?: FindOneOptions<TransactionEntity>) {
		return this._transactionsRepository.findOne(options);
	}

	async getTransactions(options?: FindManyOptions<TransactionEntity>) {
		const [data, count] = await this._transactionsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createTransaction(transaction: DeepPartial<ITransaction>) {
		try {
			const savedTransaction = await this._transactionsRepository.save(transaction);

			const findedTransaction = await this._transactionsRepository.findOne({ where: { id: savedTransaction.id } });

			this._eventsService.emit(EventsEnum.TRANSACTION_CREATED, findedTransaction);

			return findedTransaction;
		} catch (error) {
			this._loggerService.error(error, "createTransaction");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createTransactions(transactions: DeepPartial<ITransaction>[]) {
		try {
			const savedTransactions = await this._transactionsRepository.save(transactions);
			const savedIds = savedTransactions.map((savedTransaction) => savedTransaction.id);

			const findedTransactions = await this._transactionsRepository.find({ where: { id: In(savedIds) } });

			this._eventsService.emit(EventsEnum.TRANSACTIONS_CREATED, findedTransactions);

			return findedTransactions;
		} catch (error) {
			this._loggerService.error(error, "createTransactions");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateTransaction(id: string, transaction: DeepPartial<ITransaction>) {
		try {
			await this._transactionsRepository.save({ id, ...transaction });
			const updatedTransaction = await this._transactionsRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.TRANSACTION_UPDATED, updatedTransaction);

			return updatedTransaction;
		} catch (error) {
			this._loggerService.error(error, "updateTransaction");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteTransaction(id: string) {
		try {
			await this._transactionsRepository.delete(id);

			this._eventsService.emit(EventsEnum.TRANSACTION_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteTransaction");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
