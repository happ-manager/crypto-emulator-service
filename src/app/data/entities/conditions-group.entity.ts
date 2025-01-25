import { BaseEntity, GroupOperatorEnum, ICondition, IConditionsGroup, IMilestone } from "@happ-manager/crypto-api";
import { ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { ConditionEntity } from "./condition.entity";
import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: "conditions-groups" })
export class ConditionsGroupEntity extends BaseEntity implements IConditionsGroup {
	@Column({ nullable: true })
	name?: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: "enum", enum: GroupOperatorEnum })
	groupOperator: GroupOperatorEnum;

	@Column("integer", { default: 0 })
	duration: number;

	@OneToMany(() => ConditionEntity, (condition) => condition.conditionsGroup)
	conditions: ICondition[];

	@ManyToOne(() => MilestoneEntity, (milestone) => milestone.conditionsGroups, { onDelete: "CASCADE" })
	milestone: IMilestone;

	@ManyToOne(() => MilestoneEntity, { nullable: true, onDelete: "SET NULL" })
	refMilestone?: MilestoneEntity;

	@ManyToOne(() => ConditionsGroupEntity, (conditionGroup) => conditionGroup.refConditionsGroups)
	refConditionsGroup?: ConditionsGroupEntity;

	@OneToMany(() => ConditionsGroupEntity, (conditionsGroup) => conditionsGroup.refConditionsGroup)
	refConditionsGroups?: ConditionsGroupEntity[];

	@OneToMany(() => ConditionEntity, (condition) => condition.refConditionsGroup)
	refConditions?: ICondition[];
}
