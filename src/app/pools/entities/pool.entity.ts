import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { TradingTokenEntity } from "../../trading/entities/trading-token.entity";
import { ITradingToken } from "../../trading/interfaces/trading-token.interface";
import { POOLS } from "../constants/pools.constant";
import type { IPool } from "../interfaces/pool.interface";

@ObjectType()
@Entity({ name: POOLS })
export class PoolEntity extends BaseEntity implements IPool {
	@Field()
	@Column()
	address: string;

	@Field()
	@Column()
	baseMint: string;

	@Field()
	@Column()
	quoteMint: string;

	@Field()
	@Column()
	lpMint: string;

	@Field()
	@Column()
	programId: string;

	@Field()
	@Column()
	authority: string;

	@Field()
	@Column()
	openOrders: string;

	@Field()
	@Column()
	targetOrders: string;

	@Field()
	@Column()
	baseVault: string;

	@Field()
	@Column()
	quoteVault: string;

	@Field()
	@Column()
	withdrawQueue: string;

	@Field()
	@Column()
	lpVault: string;

	@Field()
	@Column()
	marketProgramId: string;

	@Field()
	@Column()
	marketId: string;

	@Field()
	@Column()
	marketAuthority: string;

	@Field()
	@Column()
	marketBaseVault: string;

	@Field()
	@Column()
	marketQuoteVault: string;

	@Field()
	@Column()
	marketBids: string;

	@Field()
	@Column()
	marketAsks: string;

	@Field()
	@Column()
	marketEventQueue: string;

	@Field()
	@Column()
	lookupTableAccount: string;

	@Field(() => Number)
	@Column("int")
	baseDecimals: number;

	@Field(() => Number)
	@Column("int")
	quoteDecimals: number;

	@Field(() => Number)
	@Column("int")
	lpDecimals: number;

	@Field(() => Number)
	@Column("int")
	version: number;

	@Field(() => Number)
	@Column("int")
	marketVersion: number;

	@Field(() => TradingTokenEntity, { nullable: true })
	@OneToOne(() => TradingTokenEntity, (tradingToken) => tradingToken.pool)
	tradingToken?: ITradingToken;
}

@ObjectType()
export class PaginatedPools extends Paginated(PoolEntity) {}
