import { OperatorEnum } from "../enums/operator.enum";

export function getOperatorValue(firstValue: number | string, operator: OperatorEnum, secondValue: number | string) {
	if (operator === OperatorEnum.MORE) {
		return firstValue > secondValue;
	}

	if (operator === OperatorEnum.MORE_EQUAL) {
		return firstValue >= secondValue;
	}

	if (operator === OperatorEnum.LESS) {
		return firstValue < secondValue;
	}

	if (operator === OperatorEnum.LESS_EQUAL) {
		return firstValue <= secondValue;
	}

	if (operator === OperatorEnum.EQUAL) {
		return firstValue === secondValue;
	}

	return false;
}
