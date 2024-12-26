import { Resolver } from "@nestjs/graphql";

import { PoolEntity } from "../entities/pool.entity";

@Resolver(() => PoolEntity)
export class PoolResolver {}
