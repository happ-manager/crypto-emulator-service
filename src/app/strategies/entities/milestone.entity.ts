import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { MILESTONES } from "../constants/milestones/milestones.constant";
import { GroupOperatorEnum } from "../enums/group-operator.enum";
import { MilestoneTypeEnum } from "../enums/milestone-type.enum";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import { IMilestone } from "../interfaces/milestone.interface";
import { IStrategy } from "../interfaces/strategy.interface";
import { ConditionsGroupEntity } from "./conditions-group.entity";
import { StrategyEntity } from "./strategy.entity";

@ObjectType()
@Entity({ name: MILESTONES })
export class MilestoneEntity extends BaseEntity implements IMilestone {
	@Field({ nullable: true })
	@Column({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	description?: string;

	@Field(() => GroupOperatorEnum)
	@Column({ type: "enum", enum: GroupOperatorEnum })
	groupOperator: GroupOperatorEnum;

	@Field(() => MilestoneTypeEnum)
	@Column({ type: "enum", enum: MilestoneTypeEnum })
	type: MilestoneTypeEnum;

	@Field({ nullable: true })
	@Column({ nullable: true })
	value?: string;

	@Field(() => Int)
	@Column("integer", { default: 0 })
	position: number;

	@Field(() => MilestoneEntity, { nullable: true })
	@ManyToOne(() => MilestoneEntity, { nullable: true, onDelete: "SET NULL" })
	refMilestone?: IMilestone;

	@Field(() => [ConditionsGroupEntity])
	@OneToMany(() => ConditionsGroupEntity, (conditionsGroup) => conditionsGroup.milestone)
	conditionsGroups: IConditionsGroup[];

	@Field(() => StrategyEntity)
	@ManyToOne(() => StrategyEntity, (strategy) => strategy.milestones, { onDelete: "CASCADE" })
	strategy: IStrategy;
}

@ObjectType()
export class PaginatedMilestones extends Paginated(MilestoneEntity) {}
