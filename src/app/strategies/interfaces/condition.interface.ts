import type { ConditionsGroupEntity } from "../entities/conditions-group.entity";
import type { CandleFieldEnum } from "../enums/candle-field.enum";
import type { OperatorEnum } from "../enums/operator.enum";
import type { RelatedToEnum } from "../enums/related-to.enum";

export interface ICondition {
	id: string;
	conditionsGroup: ConditionsGroupEntity;
	field: CandleFieldEnum;
	operator: OperatorEnum;
	relatedTo: RelatedToEnum;
	value: number;
}
