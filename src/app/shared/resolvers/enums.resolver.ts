import { Query, Resolver } from "@nestjs/graphql";

import { TransactionTypeEnum } from "../../candles/enums/transaction-type.enum";
import { ConditionFieldEnum } from "../../strategies/enums/condition-field.enum";
import { GroupOperatorEnum } from "../../strategies/enums/group-operator.enum";
import { MilestoneTypeEnum } from "../../strategies/enums/milestone-type.enum";
import { OperatorEnum } from "../../strategies/enums/operator.enum";
import { ErrorsEnum } from "../enums/errors.enum";

@Resolver()
export class EnumsResolver {
	@Query(() => [ErrorsEnum])
	getErrors() {
		return Object.values(ErrorsEnum);
	}

	@Query(() => [MilestoneTypeEnum])
	getMilestoneTypes() {
		return Object.values(MilestoneTypeEnum);
	}

	@Query(() => [ConditionFieldEnum])
	getConditionField() {
		return Object.values(ConditionFieldEnum);
	}

	@Query(() => [OperatorEnum])
	getOperators() {
		return Object.values(OperatorEnum);
	}

	@Query(() => [GroupOperatorEnum])
	getGroupOperators() {
		return Object.values(GroupOperatorEnum);
	}

	@Query(() => [TransactionTypeEnum])
	getTransactionTypes() {
		return Object.values(TransactionTypeEnum);
	}
}
