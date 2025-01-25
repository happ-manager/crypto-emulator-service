import { BaseEntity, ConditionFieldEnum, ICondition, OperatorEnum } from "@happ-manager/crypto-api";
import { ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne } from "typeorm";

import { ConditionsGroupEntity } from "./conditions-group.entity";
import { MilestoneEntity } from "./milestone.entity";

@ObjectType()
@Entity({ name: "conditions" })
export class ConditionEntity extends BaseEntity implements ICondition {
	@Column({ type: "enum", enum: ConditionFieldEnum })
	field: ConditionFieldEnum;

	@Column({ type: "enum", enum: OperatorEnum })
	operator: OperatorEnum;

	@Column()
	value: string;

	@ManyToOne(() => MilestoneEntity)
	refMilestone?: MilestoneEntity;

	@ManyToOne(() => ConditionsGroupEntity)
	refConditionsGroup?: ConditionsGroupEntity;

	@ManyToOne(() => ConditionsGroupEntity, (group) => group.conditions)
	conditionsGroup: ConditionsGroupEntity;
}
