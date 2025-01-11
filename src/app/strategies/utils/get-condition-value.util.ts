import { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { ICondition } from "../interfaces/condition.interface";

export function getConditionValue(condition: ICondition) {
	if (condition.field !== ConditionFieldEnum.AUTHOR) {
		return Number.parseFloat(condition.value);
	}

	return condition.value;
}
