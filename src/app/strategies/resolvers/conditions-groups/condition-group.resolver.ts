import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Loaders } from "../../../loaders/decorators/loaders.decorator";
import { ILoaders } from "../../../loaders/interfaces/loaders.interface";
import { ConditionEntity } from "../../entities/condition.entity";
import { ConditionsGroupEntity } from "../../entities/conditions-group.entity";

@Resolver(() => ConditionsGroupEntity)
export class ConditionsGroupResolver {
	@ResolveField(() => [ConditionEntity], { nullable: true })
	async conditions(
		@Parent() group: ConditionsGroupEntity,
		@Loaders() loaders: ILoaders
	): Promise<ConditionEntity[] | null> {
		return loaders.getConditionsByConditionsGroup.load(group.id);
	}
}
