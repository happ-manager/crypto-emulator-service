import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateTransactionDto } from "../../dtos/transactions/create-transaction.dto";
import { UpdateTransactionDto } from "../../dtos/transactions/update-transaction.dto";
import { PaginatedTransactions, TransactionEntity } from "../../entities/transaction.entity";
import { TransactionsService } from "../../services/transactions.service";

@Resolver(() => TransactionEntity)
export class TransactionsResolver {
	constructor(private readonly _transactionsService: TransactionsService) {}

	@Query(() => PaginatedTransactions)
	async transactions(@Args() args: PaginationArgs, @Args("candleId", { nullable: true }) candleId?: string) {
		return this._transactionsService.getTransactions({
			...args,
			where: {
				...(candleId ? { candle: { id: candleId } } : {})
			},
			order: {
				date: "desc"
			}
		});
	}

	@Query(() => TransactionEntity)
	async transaction(@Args() args: IdArgs) {
		const { id } = args;
		return this._transactionsService.getTransaction({ where: { id } });
	}

	@Mutation(() => TransactionEntity)
	async createTransaction(@Args("transaction") transaction: CreateTransactionDto) {
		return this._transactionsService.createTransaction(transaction);
	}

	@Mutation(() => TransactionEntity)
	async updateTransaction(@Args("transaction") transaction: UpdateTransactionDto) {
		const { id, ...data } = transaction;
		return this._transactionsService.updateTransaction(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteTransaction(@Args("id") id: string) {
		return this._transactionsService.deleteTransaction(id);
	}
}
