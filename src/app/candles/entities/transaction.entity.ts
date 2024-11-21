import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { DateColumn } from "../../libs/date/decorators/date-column.decorator";
import { IDate } from "../../libs/date/interfaces/date.interface";
import { DateScalar } from "../../libs/date/scalars/date.scalar";
import { PriceColumn } from "../../libs/price/decorators/price-column.decorator";
import { IPrice } from "../../libs/price/interfaces/price.interface";
import { PriceScalar } from "../../libs/price/scalars/price.scalar";
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
	poolAddress: string;

	@Field(() => DateScalar)
	@DateColumn()
	date: IDate;

	@Field(() => PriceScalar)
	@PriceColumn()
	price: IPrice;

	@Field(() => CandleEntity)
	@ManyToOne(() => CandleEntity, (candle) => candle.transactions, { onDelete: "CASCADE" })
	candle: ICandle;
}

@ObjectType()
export class PaginatedTransactions extends Paginated(TransactionEntity) {}
