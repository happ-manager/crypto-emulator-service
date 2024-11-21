import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";

import { DateColumn } from "../../libs/date/decorators/date-column.decorator";
import { IDate } from "../../libs/date/interfaces/date.interface";
import { DateScalar } from "../../libs/date/scalars/date.scalar";
import { PriceColumn } from "../../libs/price/decorators/price-column.decorator";
import { IPrice } from "../../libs/price/interfaces/price.interface";
import { PriceScalar } from "../../libs/price/scalars/price.scalar";
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
	poolAddress: string;

	@Field(() => DateScalar)
	@DateColumn()
	openDate: IDate;

	@Field(() => PriceScalar)
	@PriceColumn()
	openPrice: IPrice;

	@Field(() => DateScalar)
	@DateColumn()
	closeDate: IDate;

	@Field(() => PriceScalar)
	@PriceColumn()
	closePrice: IPrice;

	@Field(() => PriceScalar)
	@PriceColumn()
	minPrice: IPrice;

	@Field(() => PriceScalar)
	@PriceColumn()
	maxPrice: IPrice;

	@Field(() => [TransactionEntity])
	@OneToMany(() => TransactionEntity, (transaction) => transaction.candle)
	transactions: ITransaction[];
}

@ObjectType()
export class PaginatedCandles extends Paginated(CandleEntity) {}
