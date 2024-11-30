import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { CONDITIONS } from "../constants/conditions/conditions.constant";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import { OperatorEnum } from "../enums/operator.enum";
import type { ICondition } from "../interfaces/condition.interface";
import { ConditionsGroupEntity } from "./conditions-group.entity";
import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: CONDITIONS })
export class ConditionEntity extends BaseEntity implements ICondition {
	@Field(() => ConditionFieldEnum)
	@Column({ type: "enum", enum: ConditionFieldEnum })
	field: ConditionFieldEnum;

	@Field(() => OperatorEnum)
	@Column({ type: "enum", enum: OperatorEnum })
	operator: OperatorEnum;

	@Field()
	@Column()
	value: string;

	@Field(() => MilestoneEntity, { nullable: true })
	@ManyToOne(() => MilestoneEntity, { nullable: true, onDelete: "SET NULL" })
	refMilestone?: MilestoneEntity;

	@Field(() => ConditionsGroupEntity, { nullable: true })
	@ManyToOne(() => ConditionsGroupEntity, { nullable: true, onDelete: "SET NULL" })
	refConditionsGroup?: ConditionsGroupEntity;

	@Field(() => ConditionsGroupEntity)
	@ManyToOne(() => ConditionsGroupEntity, (group) => group.conditions, { onDelete: "CASCADE" })
	conditionsGroup: ConditionsGroupEntity;
}

@ObjectType()
export class PaginatedConditions extends Paginated(ConditionEntity) {}
