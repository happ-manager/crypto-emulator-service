import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateTradingDto } from "../../dtos/tradings/create-trading.dto";
import { UpdateTradingDto } from "../../dtos/tradings/update-trading.dto";
import { PaginatedTradings, TradingEntity } from "../../entities/trading.entity";
import { TradingsService } from "../../services/tradings.service";

@Resolver(() => TradingEntity)
export class TradingsResolver {
	constructor(private readonly tradingsService: TradingsService) {}

	@Query(() => PaginatedTradings)
	async tradings(@Args() args: PaginationArgs) {
		return this.tradingsService.getTradings(args);
	}

	@Query(() => TradingEntity)
	async trading(@Args() args: IdArgs) {
		const { id } = args;
		return this.tradingsService.getTrading({ where: { id } });
	}

	@Mutation(() => TradingEntity)
	async createTrading(@Args("trading") trading: CreateTradingDto) {
		return this.tradingsService.createTrading(trading);
	}

	@Mutation(() => TradingEntity)
	async updateTrading(@Args("trading") trading: UpdateTradingDto) {
		const { id, ...data } = trading;
		return this.tradingsService.updateTrading(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteTrading(@Args("id") id: string) {
		return this.tradingsService.deleteTrading(id);
	}
}
