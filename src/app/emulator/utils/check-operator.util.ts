import { OperatorEnum } from "../../strategies/enums/operator.enum";

export function checkOperator(firstValue: number, secondValue: number, operator: OperatorEnum) {
	if (operator === OperatorEnum.MORE) {
		return firstValue >= secondValue;
	} else if (operator === OperatorEnum.LESS) {
		return firstValue <= secondValue;
	}

	return false;
}
