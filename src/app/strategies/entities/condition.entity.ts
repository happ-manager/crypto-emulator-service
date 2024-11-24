import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { CONDITIONS } from "../constants/conditions/conditions.constant";
import { ConditionFieldEnum } from "../enums/condition-field.enum";
import { OperatorEnum } from "../enums/operator.enum";
import { RelatedToEnum } from "../enums/related-to.enum";
import type { ICondition } from "../interfaces/condition.interface";
import { ConditionsGroupEntity } from "./conditions-group.entity";

@ObjectType()
@Entity({ name: CONDITIONS })
export class ConditionEntity extends BaseEntity implements ICondition {
	@Field(() => ConditionsGroupEntity)
	@ManyToOne(() => ConditionsGroupEntity, (group) => group.conditions)
	conditionsGroup: ConditionsGroupEntity;

	@Field(() => ConditionFieldEnum)
	@Column({ type: "enum", enum: ConditionFieldEnum })
	field: ConditionFieldEnum;

	@Field(() => OperatorEnum)
	@Column({ type: "enum", enum: OperatorEnum })
	operator: OperatorEnum;

	@Field(() => RelatedToEnum)
	@Column({ type: "enum", enum: RelatedToEnum })
	relatedTo: RelatedToEnum;

	@Field(() => Int)
	@Column("integer", { default: 0 })
	value: number;
}

@ObjectType()
export class PaginatedConditions extends Paginated(ConditionEntity) {}
