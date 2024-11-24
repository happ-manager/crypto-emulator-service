import { Query, Resolver } from "@nestjs/graphql";

import { ActionTypeEnum } from "../../strategies/enums/action-type.enum";
import { ConditionFieldEnum } from "../../strategies/enums/condition-field.enum";
import { GroupOperatorEnum } from "../../strategies/enums/group-operator.enum";
import { OperatorEnum } from "../../strategies/enums/operator.enum";
import { RelatedToEnum } from "../../strategies/enums/related-to.enum";
import { ErrorsEnum } from "../enums/errors.enum";

@Resolver()
export class EnumsResolver {
	@Query(() => [ErrorsEnum])
	getErrors() {
		return Object.values(ErrorsEnum);
	}

	@Query(() => [ActionTypeEnum])
	getActionTypes() {
		return Object.values(ActionTypeEnum);
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

	@Query(() => [RelatedToEnum])
	getRelatedTo() {
		return Object.values(RelatedToEnum);
	}
}
