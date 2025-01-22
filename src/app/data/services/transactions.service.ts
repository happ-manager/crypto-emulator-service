import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";

import { TransactionEntity } from "../entities/transaction.entity";

@Injectable()
export class TransactionsService {
	constructor(
		@InjectRepository(TransactionEntity) private readonly _transactionsRepository: Repository<TransactionEntity>
	) {}

	async getTransactions(options?: FindManyOptions<TransactionEntity>) {
		return this._transactionsRepository.find(options);
	}
}
