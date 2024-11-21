import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../../shared/graphql/decorators/pagination-args.decorator";
import { CreateTradingTokenDto } from "../../dtos/trading-tokens/create-trading-token.dto";
import { UpdateTradingTokenDto } from "../../dtos/trading-tokens/update-trading-token.dto";
import { PaginatedTradingTokens, TradingTokenEntity } from "../../entities/trading-token.entity";
import { TradingTokensService } from "../../services/trading-tokens.service";

@Resolver(() => TradingTokenEntity)
export class TradingTokensResolver {
	constructor(private readonly tradingTokensService: TradingTokensService) {}

	@Query(() => PaginatedTradingTokens)
	async tradingTokens(@Args() args: PaginationArgs, @Args("tradingId", { nullable: true }) tradingId?: string) {
		return this.tradingTokensService.getTradingTokens({
			...args,
			where: {
				...(tradingId ? { trading: { id: tradingId } } : {})
			},
			order: {
				signaledAt: "desc"
			}
		});
	}

	@Query(() => TradingTokenEntity)
	async tradingToken(@Args() args: IdArgs) {
		const { id } = args;
		return this.tradingTokensService.getTradingToken({ where: { id } });
	}

	@Mutation(() => TradingTokenEntity)
	async createTradingToken(@Args("tradingToken") tradingToken: CreateTradingTokenDto) {
		return this.tradingTokensService.createTradingToken(tradingToken);
	}

	@Mutation(() => TradingTokenEntity)
	async updateTradingToken(@Args("tradingToken") tradingToken: UpdateTradingTokenDto) {
		const { id, ...data } = tradingToken;
		return this.tradingTokensService.updateTradingToken(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteTradingToken(@Args("id") id: string) {
		return this.tradingTokensService.deleteTradingToken(id);
	}
}
