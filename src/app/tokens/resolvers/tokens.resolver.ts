import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateTokenDto } from "../dtos/create-token.dto";
import { UpdateTokenDto } from "../dtos/update-token.dto";
import { PaginatedTokens, TokenEntity } from "../entities/token.entity";
import { TokensService } from "../services/tokens.service";

@Resolver(() => TokenEntity)
export class TokensResolver {
	constructor(private readonly _tokensService: TokensService) {}

	@Query(() => PaginatedTokens)
	async tokens(@Args() args: PaginationArgs, @Args("signalId", { nullable: true }) signalId?: string) {
		return this._tokensService.getTokens({
			...args,
			where: {
				...(signalId ? { signal: { id: signalId } } : {})
			},
			order: {
				createdAt: "desc"
			}
		});
	}

	@Query(() => TokenEntity)
	async token(@Args() args: IdArgs) {
		const { id } = args;
		return this._tokensService.getToken({ where: { id } });
	}

	@Mutation(() => TokenEntity)
	async createToken(@Args("token") token: CreateTokenDto) {
		return this._tokensService.createToken(token);
	}

	@Mutation(() => TokenEntity)
	async updateToken(@Args("token") token: UpdateTokenDto) {
		const { id, ...data } = token;
		return this._tokensService.updateToken(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteToken(@Args("id") id: string) {
		return this._tokensService.deleteToken(id);
	}
}
