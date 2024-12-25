import { OperatorEnum } from "../enums/operator.enum";

export function getOperatorValue(firstValue: number, secondValue: number, operator: OperatorEnum) {
	switch (operator) {
		case OperatorEnum.MORE: {
			return firstValue > secondValue;
		}
		case OperatorEnum.MORE_EQUAL: {
			return firstValue >= secondValue;
		}
		case OperatorEnum.LESS: {
			return firstValue < secondValue;
		}
		case OperatorEnum.LESS_EQUAL: {
			return firstValue <= secondValue;
		}
		case OperatorEnum.EQUAL: {
			return firstValue === secondValue;
		}
		// No default
	}

	return false;
}
