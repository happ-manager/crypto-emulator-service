import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { TradingEntity } from "../../trading/entities/trading.entity";
import type { ITrading } from "../../trading/interfaces/trading.interface";
import { WALLETS } from "../constants/wallets.constant";
import type { IWallet } from "../interfaces/wallet.interface";

@ObjectType()
@Entity({ name: WALLETS })
export class WalletEntity extends BaseEntity implements IWallet {
	@Field()
	@Column()
	name: string;

	@Field()
	@Column()
	address: string;

	@Column({ nullable: true })
	secret?: string;

	@Field(() => [TradingEntity])
	@OneToMany(() => TradingEntity, (trading) => trading.targetWallet)
	targetTradings: ITrading[];

	@Field(() => [TradingEntity])
	@OneToMany(() => TradingEntity, (trading) => trading.sourceWallet)
	sourceTradings: ITrading[];
}

@ObjectType()
export class PaginatedWallets extends Paginated(WalletEntity) {}
