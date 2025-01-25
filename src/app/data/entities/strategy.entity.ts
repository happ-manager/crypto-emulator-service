import { BaseEntity, IMilestone, IStrategy, PredefinedStrategyEnum } from "@happ-manager/crypto-api";
import { ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany } from "typeorm";

import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: "strategies" })
export class StrategyEntity extends BaseEntity implements IStrategy {
	@Column()
	name: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: "enum", enum: PredefinedStrategyEnum, nullable: true })
	predefinedStrategy?: PredefinedStrategyEnum;

	@OneToMany(() => MilestoneEntity, (milestone) => milestone.strategy)
	milestones: IMilestone[];
}
