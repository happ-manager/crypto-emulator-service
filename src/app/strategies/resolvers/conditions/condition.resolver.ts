import { Resolver } from "@nestjs/graphql";

import { ConditionEntity } from "../../entities/condition.entity";

@Resolver(() => ConditionEntity)
export class ConditionResolver {}
