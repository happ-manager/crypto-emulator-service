import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TRANSACTIONS } from "../constants/transactions/transactions.constant";
import { TRANSACTIONS_ENDPOINTS } from "../constants/transactions/transactions-endpoints.constant";
import { AccessTransactionGuard } from "../guards/transactions/access-transaction.guard";
import { CreateTransactionGuard } from "../guards/transactions/create-transaction.guard";
import type { ITransaction } from "../interfaces/transaction.interface";
import { TransactionsService } from "../services/transactions.service";

@ApiTags(TRANSACTIONS)
@Controller(TRANSACTIONS_ENDPOINTS.BASE)
export class TransactionsController {
	constructor(private readonly _transactionsService: TransactionsService) {}

	@Get(TRANSACTIONS_ENDPOINTS.GET_TRANSACTION)
	async getTransaction(@Param("id") id: string) {
		return this._transactionsService.getTransaction({ where: { id } });
	}

	@Get(TRANSACTIONS_ENDPOINTS.GET_TRANSACTIONS)
	async getTransactions() {
		return this._transactionsService.getTransactions();
	}

	@Post(TRANSACTIONS_ENDPOINTS.CREATE_TRANSACTION)
	@UseGuards(CreateTransactionGuard)
	async createTransaction(@Body() transaction: Partial<ITransaction>) {
		return this._transactionsService.createTransaction(transaction);
	}

	@Patch(TRANSACTIONS_ENDPOINTS.UPDATE_TRANSACTION)
	@UseGuards(AccessTransactionGuard)
	async updateTransaction(@Param("id") transactionId: string, @Body() transaction: Partial<ITransaction>) {
		return this._transactionsService.updateTransaction(transactionId, transaction);
	}

	@Delete(TRANSACTIONS_ENDPOINTS.DELETE_TRANSACTION)
	@UseGuards(AccessTransactionGuard)
	async deleteTransaction(@Param("id") transactionId: string) {
		return this._transactionsService.deleteTransaction(transactionId);
	}
}
