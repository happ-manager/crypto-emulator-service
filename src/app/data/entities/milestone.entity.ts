import {
	BaseEntity,
	GroupOperatorEnum,
	ICondition,
	IConditionsGroup,
	IMilestone,
	IStrategy,
	MilestoneTypeEnum
} from "@happ-manager/crypto-api";
import { ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { ConditionEntity } from "./condition.entity";
import { ConditionsGroupEntity } from "./conditions-group.entity";
import { StrategyEntity } from "./strategy.entity";

@ObjectType()
@Entity({ name: "milestones" })
export class MilestoneEntity extends BaseEntity implements IMilestone {
	@Column({ nullable: true })
	name?: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: "enum", enum: GroupOperatorEnum })
	groupOperator: GroupOperatorEnum;

	@Column({ type: "enum", enum: MilestoneTypeEnum })
	type: MilestoneTypeEnum;

	@Column({ nullable: true })
	value?: string;

	@Column("integer", { default: 0 })
	position: number;

	@OneToMany(() => ConditionsGroupEntity, (conditionsGroup) => conditionsGroup.milestone)
	conditionsGroups: IConditionsGroup[];

	@ManyToOne(() => StrategyEntity, (strategy) => strategy.milestones, { onDelete: "CASCADE" })
	strategy: IStrategy;

	@ManyToOne(() => MilestoneEntity, (milestone) => milestone.refMilestones, { nullable: true, onDelete: "SET NULL" })
	refMilestone?: IMilestone;

	@OneToMany(() => MilestoneEntity, (milestone) => milestone.refMilestone)
	refMilestones?: IMilestone[];

	@OneToMany(() => ConditionsGroupEntity, (conditionGroup) => conditionGroup.refMilestone)
	refConditionsGroups?: IConditionsGroup[];

	@OneToMany(() => ConditionEntity, (condition) => condition.refMilestone)
	refConditions?: ICondition[];
}
