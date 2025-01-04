import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { TradingEntity } from "../../trading/entities/trading.entity";
import type { ITrading } from "../../trading/interfaces/trading.interface";
import { STRATEGIES } from "../constants/strategies/strategies.constant";
import { PredefinedStrategyEnum } from "../enums/predefined-strategy.enum";
import type { IMilestone } from "../interfaces/milestone.interface";
import type { IStrategy } from "../interfaces/strategy.interface";
import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: STRATEGIES })
export class StrategyEntity extends BaseEntity implements IStrategy {
	@Field()
	@Column()
	name: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	description?: string;

	@Field(() => PredefinedStrategyEnum, { nullable: true })
	@Column({ type: "enum", enum: PredefinedStrategyEnum, nullable: true })
	predefinedStrategy?: PredefinedStrategyEnum;

	@Field(() => [TradingEntity])
	@OneToMany(() => TradingEntity, (trading) => trading.strategy)
	tradings: ITrading[];

	@Field(() => [MilestoneEntity])
	@OneToMany(() => MilestoneEntity, (milestone) => milestone.strategy)
	milestones: IMilestone[];
}

@ObjectType()
export class PaginatedStrategies extends Paginated(StrategyEntity) {}
