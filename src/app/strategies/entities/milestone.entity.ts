import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { MILESTONES } from "../constants/milestones/milestones.constant";
import { ActionTypeEnum } from "../enums/action-type.enum";
import { GroupOperatorEnum } from "../enums/group-operator.enum";
import type { IConditionsGroup } from "../interfaces/conditions-group.interface";
import type { IMilestone } from "../interfaces/milestone.interface";
import { IStrategy } from "../interfaces/strategy.interface";
import { ConditionsGroupEntity } from "./conditions-group.entity";
import { StrategyEntity } from "./strategy.entity";

@ObjectType()
@Entity({ name: MILESTONES })
export class MilestoneEntity extends BaseEntity implements IMilestone {
	@Field({ nullable: true })
	@Column({ nullable: true })
	name: string;

	@Field(() => StrategyEntity)
	@ManyToOne(() => StrategyEntity, (strategy) => strategy.milestones)
	strategy: IStrategy;

	@Field(() => [ConditionsGroupEntity])
	@OneToMany(() => ConditionsGroupEntity, (conditionsGroup) => conditionsGroup.milestone)
	conditionsGroups: IConditionsGroup[];

	@Field(() => GroupOperatorEnum)
	@Column({ type: "enum", enum: GroupOperatorEnum })
	groupOperator: GroupOperatorEnum;

	@Field(() => ActionTypeEnum)
	@Column({ type: "enum", enum: ActionTypeEnum })
	actionType: ActionTypeEnum;

	@Field(() => Int)
	@Column("integer", { default: 0 })
	value: number;

	@Field(() => Int)
	@Column("integer", { default: 0 })
	position: number;
}

@ObjectType()
export class PaginatedMilestones extends Paginated(MilestoneEntity) {}
