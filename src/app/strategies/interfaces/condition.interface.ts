import type { ConditionsGroupEntity } from "../entities/conditions-group.entity";
import type { ConditionFieldEnum } from "../enums/condition-field.enum";
import type { OperatorEnum } from "../enums/operator.enum";
import type { RelatedToEnum } from "../enums/related-to.enum";

export interface ICondition {
	id: string;
	conditionsGroup: ConditionsGroupEntity;
	field: ConditionFieldEnum;
	operator: OperatorEnum;
	relatedTo: RelatedToEnum;
	value: number;
}
