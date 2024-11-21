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
import { TRADING_TOKENS } from "../constants/tradings-tokens/tradings-tokens.constant";
import { TradingTokenStatusEnum } from "../enums/trading-token-status.enum";
import { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingEntity } from "./trading.entity";

@ObjectType()
@Entity({ name: TRADING_TOKENS })
export class TradingTokenEntity extends BaseEntity implements ITradingToken {
	@Field()
	@Column()
	walletAddress: string;

	@Field()
	@Column()
	poolAddress: string;

	@Field(() => TradingTokenStatusEnum, { defaultValue: TradingTokenStatusEnum.SIGNALED })
	@Column({ type: "enum", enum: TradingTokenStatusEnum, default: TradingTokenStatusEnum.SIGNALED })
	status: TradingTokenStatusEnum;

	@Field(() => DateScalar, { nullable: true })
	@DateColumn({ nullable: true })
	signaledAt: IDate;

	@Field(() => PriceScalar, { nullable: true })
	@PriceColumn({ nullable: true })
	signaledPrice?: IPrice;

	@Field(() => DateScalar, { nullable: true })
	@DateColumn({ nullable: true })
	enterAt?: IDate;

	@Field(() => PriceScalar, { nullable: true })
	@PriceColumn({ nullable: true })
	enterPrice?: IPrice;

	@Field(() => DateScalar, { nullable: true })
	@DateColumn({ nullable: true })
	exitAt?: IDate;

	@Field(() => PriceScalar, { nullable: true })
	@PriceColumn({ nullable: true })
	exitPrice?: IPrice;

	@Field(() => PriceScalar, { nullable: true })
	@PriceColumn({ nullable: true })
	initialPrice?: IPrice;

	@Field(() => DateScalar, { nullable: true })
	@DateColumn({ nullable: true })
	initialAt?: IDate;

	@Field(() => TradingEntity)
	@ManyToOne(() => TradingEntity, (trading) => trading.tradingTokens)
	trading: ITrading;
}

@ObjectType()
export class PaginatedTradingTokens extends Paginated(TradingTokenEntity) {}
