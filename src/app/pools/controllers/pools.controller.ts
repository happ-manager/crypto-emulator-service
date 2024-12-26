import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { POOLS } from "../constants/pools.constant";
import { POOLS_ENDPOINTS } from "../constants/pools-endpoints.constant";
import { AccessPoolGuard } from "../guards/access-pool.guard";
import type { IPool } from "../interfaces/pool.interface";
import { PoolsService } from "../services/pools.service";

@ApiTags(POOLS)
@Controller(POOLS_ENDPOINTS.BASE)
export class PoolsController {
	constructor(private readonly _poolsService: PoolsService) {}

	@Get(POOLS_ENDPOINTS.GET_POOL)
	async getPool(@Param("id") id: string) {
		return this._poolsService.getPool({ where: { id } });
	}

	@Get(POOLS_ENDPOINTS.GET_POOLS)
	async getPools() {
		return this._poolsService.getPools();
	}

	@Post(POOLS_ENDPOINTS.CREATE_POOL)
	@UseGuards(AccessPoolGuard)
	async createPool(@Body() pool: Partial<IPool>) {
		return this._poolsService.createPool(pool);
	}

	@Patch(POOLS_ENDPOINTS.UPDATE_POOL)
	@UseGuards(AccessPoolGuard)
	async updatePool(@Param("id") poolId: string, @Body() pool: Partial<IPool>) {
		return this._poolsService.updatePool(poolId, pool);
	}

	@Delete(POOLS_ENDPOINTS.DELETE_POOL)
	@UseGuards(AccessPoolGuard)
	async deletePool(@Param("id") poolId: string) {
		return this._poolsService.deletePool(poolId);
	}
}
