import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { PriceColumn } from "../../libs/price/decorators/price-column.decorator";
import { IPrice } from "../../libs/price/interfaces/price.interface";
import { PriceScalar } from "../../libs/price/scalars/price.scalar";
import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { StrategyEntity } from "../../strategies/entities/strategy.entity";
import { IStrategy } from "../../strategies/interfaces/strategy.interface";
import { WalletEntity } from "../../wallets/entities/wallet.entity";
import { IWallet } from "../../wallets/interfaces/wallet.interface";
import { TRADINGS } from "../constants/tradings/tradings.constant";
import type { ITrading } from "../interfaces/trading.interface";
import type { ITradingToken } from "../interfaces/trading-token.interface";
import { TradingTokenEntity } from "./trading-token.entity";

@ObjectType()
@Entity({ name: TRADINGS })
export class TradingEntity extends BaseEntity implements ITrading {
	@Field(() => PriceScalar)
	@PriceColumn()
	price: IPrice;

	@Field(() => Boolean, { defaultValue: true })
	@Column("boolean", { default: true })
	disabled: boolean;

	@Field(() => Number, { nullable: true })
	@Column("integer", { nullable: true })
	tokenTradingDuration: number;

	@Field(() => Number, { nullable: true })
	@Column("integer", { nullable: true })
	microLamports: number;

	@Field(() => Number, { nullable: true })
	@Column("integer", { nullable: true })
	units: number;

	@Field(() => StrategyEntity)
	@ManyToOne(() => StrategyEntity, (strategy) => strategy.tradings)
	strategy: IStrategy;

	@Field(() => WalletEntity)
	@ManyToOne(() => WalletEntity, (wallet) => wallet.targetTradings)
	targetWallet: IWallet;

	@Field(() => WalletEntity)
	@ManyToOne(() => WalletEntity, (wallet) => wallet.sourceTradings)
	sourceWallet: IWallet;

	@Field(() => [TradingTokenEntity], { nullable: true })
	@OneToMany(() => TradingTokenEntity, (tradingToken) => tradingToken.trading, { nullable: true })
	tradingTokens?: ITradingToken[];
}

@ObjectType()
export class PaginatedTradings extends Paginated(TradingEntity) {}
