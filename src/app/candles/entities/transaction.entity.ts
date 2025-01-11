import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { TRANSACTIONS } from "../constants/transactions/transactions.constant";
import { ICandle } from "../interfaces/candle.interface";
import type { ITransaction } from "../interfaces/transaction.interface";
import { CandleEntity } from "./candle.entity";

@ObjectType()
@Entity({ name: TRANSACTIONS })
export class TransactionEntity extends BaseEntity implements ITransaction {
	@Field()
	@Column()
	@Index()
	poolAddress: string;

	@Field(() => Date)
	@Column("timestamptz")
	date: Date;

	@Field(() => Number)
	@Column("decimal")
	price: number;

	@Field(() => Number)
	@Column("decimal")
	nextPrice: number;

	@Field({ nullable: true })
	@Column({ nullable: true })
	signature: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	author: string;

	@Field(() => CandleEntity, { nullable: true })
	@ManyToOne(() => CandleEntity, (candle) => candle.transactions, { nullable: true, onDelete: "SET NULL" })
	candle?: ICandle;
}

@ObjectType()
export class PaginatedTransactions extends Paginated(TransactionEntity) {}
