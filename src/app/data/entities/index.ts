import { ConditionEntity } from "./condition.entity";
import { ConditionsGroupEntity } from "./conditions-group.entity";
import { MilestoneEntity } from "./milestone.entity";
import { SignalEntity } from "./signal.entity";
import { StrategyEntity } from "./strategy.entity";
import { TransactionEntity } from "./transaction.entity";

export const DATA_ENTITIES = [
	TransactionEntity,
	SignalEntity,
	StrategyEntity,
	MilestoneEntity,
	ConditionsGroupEntity,
	ConditionEntity
];
