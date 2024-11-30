import { GroupOperatorEnum } from "../enums/group-operator.enum";

export function getGroupOperatorValue<T>(options: T[], groupOperator: GroupOperatorEnum) {
	if (groupOperator === GroupOperatorEnum.AND) {
		return options.every(Boolean) ? options : [];
	} else if (groupOperator === GroupOperatorEnum.OR) {
		return options.some(Boolean) ? options.filter((option) => Boolean(option)) : [];
	}

	return [];
}
