import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { CANDLES } from "../constants/candles/candles.constant";
import type { ICandle } from "../interfaces/candle.interface";
import type { ITransaction } from "../interfaces/transaction.interface";
import { TransactionEntity } from "./transaction.entity";

@ObjectType()
@Entity({ name: CANDLES })
export class CandleEntity extends BaseEntity implements ICandle {
	@Field()
	@Column()
	@Index()
	poolAddress: string;

	@Field(() => Date)
	@Column("timestamptz")
	openDate: Date;

	@Field(() => Number)
	@Column("decimal")
	openPrice: number;

	@Field(() => Date)
	@Column("timestamptz")
	closeDate: Date;

	@Field(() => Number)
	@Column("decimal")
	closePrice: number;

	@Field(() => Number)
	@Column("decimal")
	minPrice: number;

	@Field(() => Number)
	@Column("decimal")
	maxPrice: number;

	@Field(() => [TransactionEntity])
	@OneToMany(() => TransactionEntity, (transaction) => transaction.candle)
	transactions: ITransaction[];
}

@ObjectType()
export class PaginatedCandles extends Paginated(CandleEntity) {}
