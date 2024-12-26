import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreatePoolDto } from "../dtos/create-pool.dto";
import { UpdatePoolDto } from "../dtos/update-pool.dto";
import { PaginatedPools, PoolEntity } from "../entities/pool.entity";
import { PoolsService } from "../services/pools.service";

@Resolver(() => PoolEntity)
export class PoolsResolver {
	constructor(private readonly _poolsService: PoolsService) {}

	@Query(() => PaginatedPools)
	async pools(@Args() args: PaginationArgs) {
		return this._poolsService.getPools({
			...args,
			order: {
				createdAt: "desc"
			}
		});
	}

	@Query(() => PoolEntity)
	async pool(@Args() args: IdArgs) {
		const { id } = args;
		return this._poolsService.getPool({ where: { id } });
	}

	@Mutation(() => PoolEntity)
	async createPool(@Args("pool") pool: CreatePoolDto) {
		return this._poolsService.createPool(pool);
	}

	@Mutation(() => PoolEntity)
	async updatePool(@Args("pool") pool: UpdatePoolDto) {
		const { id, ...data } = pool;
		return this._poolsService.updatePool(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deletePool(@Args("id") id: string) {
		return this._poolsService.deletePool(id);
	}
}
