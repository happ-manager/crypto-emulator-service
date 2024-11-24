import { OperatorEnum } from "../../strategies/enums/operator.enum";
import type { ICondition } from "../../strategies/interfaces/condition.interface";

export function getConditionValue(condition: ICondition) {
	return condition.value * (condition.operator === OperatorEnum.MORE ? 1 : -1);
}
