import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { PoolEntity } from "../../pools/entities/pool.entity";
import { IPool } from "../../pools/interfaces/pool.interface";
import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { ICheckedStrategy } from "../../strategies/interfaces/checked.interface";
import { TokenEntity } from "../../tokens/entities/token.entity";
import { IToken } from "../../tokens/interfaces/token.interface";
import { TRADING_TOKENS } from "../constants/tradings-tokens/tradings-tokens.constant";
import { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingEntity } from "./trading.entity";

@ObjectType()
@Entity({ name: TRADING_TOKENS })
export class TradingTokenEntity extends BaseEntity implements ITradingToken {
	@Field(() => Number)
	@Column("decimal")
	amount: number;

	@Field(() => Date)
	@Column("timestamptz")
	signaledAt: Date;

	@Field(() => Boolean, { defaultValue: false })
	@Column("boolean", { default: false })
	disabled: boolean;

	@Field(() => TradingEntity)
	@ManyToOne(() => TradingEntity, (trading) => trading.tradingTokens, { onDelete: "CASCADE" })
	trading: ITrading;

	@Field(() => TokenEntity)
	@ManyToOne(() => TokenEntity, (token) => token.tradingTokens, { cascade: true })
	token: IToken;

	@Field(() => PoolEntity)
	@OneToOne(() => PoolEntity, (pool) => pool.tradingToken, { cascade: true })
	@JoinColumn()
	pool: IPool;

	@Field(() => GraphQLJSON)
	@Column({ type: "jsonb" })
	checkedStrategy: ICheckedStrategy;
}

@ObjectType()
export class PaginatedTradingTokens extends Paginated(TradingTokenEntity) {}
