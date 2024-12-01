import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { Column, Entity, ManyToOne } from "typeorm";

import { DateColumn } from "../../libs/date/decorators/date-column.decorator";
import { IDate } from "../../libs/date/interfaces/date.interface";
import { DateScalar } from "../../libs/date/scalars/date.scalar";
import { PriceColumn } from "../../libs/price/decorators/price-column.decorator";
import { IPrice } from "../../libs/price/interfaces/price.interface";
import { PriceScalar } from "../../libs/price/scalars/price.scalar";
import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { IChecked } from "../../strategies/interfaces/checked.interface";
import type { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { TokenEntity } from "../../tokens/entities/token.entity";
import { IToken } from "../../tokens/interfaces/token.interface";
import { TRADING_TOKENS } from "../constants/tradings-tokens/tradings-tokens.constant";
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

	@Field(() => PriceScalar)
	@PriceColumn()
	price: IPrice;

	@Field(() => DateScalar)
	@DateColumn()
	signaledAt: IDate;

	@Field(() => TradingEntity)
	@ManyToOne(() => TradingEntity, (trading) => trading.tradingTokens, { onDelete: "CASCADE" })
	trading: ITrading;

	@Field(() => TokenEntity, { nullable: true })
	@ManyToOne(() => TokenEntity, (token) => token.tradingTokens, { nullable: true, onDelete: "SET NULL" })
	token?: IToken;

	@Field(() => GraphQLJSON, { nullable: true })
	@Column({ type: "jsonb", nullable: true })
	checkedStrategy?: IChecked<IStrategy>;
}

@ObjectType()
export class PaginatedTradingTokens extends Paginated(TradingTokenEntity) {}
