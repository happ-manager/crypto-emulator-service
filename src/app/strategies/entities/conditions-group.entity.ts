import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { CONDITIONS_GROUPS } from "../constants/conditions-groups/conditions-groups.constant";
import { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { ICondition } from "../interfaces/condition.interface";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import { IMilestone } from "../interfaces/milestone.interface";
import { ConditionEntity } from "./condition.entity";
import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: CONDITIONS_GROUPS })
export class ConditionsGroupEntity extends BaseEntity implements IConditionsGroup {
	@Field({ nullable: true })
	@Column({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	description?: string;

	@Field(() => GroupOperatorEnum)
	@Column({ type: "enum", enum: GroupOperatorEnum })
	groupOperator: GroupOperatorEnum;

	@Field(() => Int)
	@Column("integer", { default: 0 })
	duration: number;

	@Field(() => MilestoneEntity, { nullable: true })
	@ManyToOne(() => MilestoneEntity, { nullable: true, onDelete: "SET NULL" })
	refMilestone?: MilestoneEntity;

	@Field(() => ConditionsGroupEntity, { nullable: true })
	@ManyToOne(() => ConditionsGroupEntity, { nullable: true, onDelete: "SET NULL" })
	refConditionsGroup?: ConditionsGroupEntity;

	@Field(() => [ConditionEntity], { nullable: true })
	@OneToMany(() => ConditionEntity, (condition) => condition.conditionsGroup)
	conditions: ICondition[];

	@Field(() => MilestoneEntity)
	@ManyToOne(() => MilestoneEntity, (milestone) => milestone.conditionsGroups, { onDelete: "CASCADE" })
	milestone: IMilestone;
}

@ObjectType()
export class PaginatedConditionsGroups extends Paginated(ConditionsGroupEntity) {}
