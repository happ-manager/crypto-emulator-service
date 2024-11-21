import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateCandleDto } from "../../dtos/candles/create-candle.dto";
import { UpdateCandleDto } from "../../dtos/candles/update-candle.dto";
import { CandleEntity, PaginatedCandles } from "../../entities/candle.entity";
import { CandlesService } from "../../services/candles.service";

@Resolver(() => CandleEntity)
export class CandlesResolver {
	constructor(private readonly _candlesService: CandlesService) {}

	@Query(() => PaginatedCandles)
	async candles(@Args() args: PaginationArgs, @Args("poolAddress", { nullable: true }) poolAddress?: string) {
		return this._candlesService.getCandles({
			...args,
			where: {
				...(poolAddress ? { poolAddress } : {})
			},
			order: {
				openDate: "desc"
			}
		});
	}

	@Query(() => CandleEntity)
	async candle(@Args() args: IdArgs) {
		const { id } = args;
		return this._candlesService.getCandle({ where: { id } });
	}

	@Mutation(() => CandleEntity)
	async createCandle(@Args("candle") candle: CreateCandleDto) {
		return this._candlesService.createCandle(candle);
	}

	@Mutation(() => CandleEntity)
	async updateCandle(@Args("candle") candle: UpdateCandleDto) {
		const { id, ...data } = candle;
		return this._candlesService.updateCandle(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteCandle(@Args("id") id: string) {
		return this._candlesService.deleteCandle(id);
	}
}
