import { GroupOperatorEnum } from "../../strategies/enums/group-operator.enum";

export function checkGroupOperator<T>(options: T[], groupOperator: GroupOperatorEnum) {
	if (groupOperator === GroupOperatorEnum.AND) {
		return options.every(Boolean) ? options : [];
	} else if (groupOperator === GroupOperatorEnum.OR) {
		return options.some(Boolean) ? options.filter((option) => Boolean(option)) : [];
	}

	return [];
}
