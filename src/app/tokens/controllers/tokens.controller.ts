import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { TOKENS } from "../constants/tokens.constant";
import { TOKENS_ENDPOINTS } from "../constants/tokens-endpoints.constant";
import { AccessTokenGuard } from "../guards/access-token.guard";
import type { IToken } from "../interfaces/token.interface";
import { TokensService } from "../services/tokens.service";

@ApiTags(TOKENS)
@Controller(TOKENS_ENDPOINTS.BASE)
export class TokensController {
	constructor(private readonly _tokensService: TokensService) {}

	@Get(TOKENS_ENDPOINTS.GET_TOKEN)
	async getToken(@Param("id") id: string) {
		return this._tokensService.getToken({ where: { id } });
	}

	@Get(TOKENS_ENDPOINTS.GET_TOKENS)
	async getTokens() {
		return this._tokensService.getTokens();
	}

	@Post(TOKENS_ENDPOINTS.CREATE_TOKEN)
	@UseGuards(AccessTokenGuard)
	async createToken(@Body() token: Partial<IToken>) {
		return this._tokensService.createToken(token);
	}

	@Patch(TOKENS_ENDPOINTS.UPDATE_TOKEN)
	@UseGuards(AccessTokenGuard)
	async updateToken(@Param("id") tokenId: string, @Body() token: Partial<IToken>) {
		return this._tokensService.updateToken(tokenId, token);
	}

	@Delete(TOKENS_ENDPOINTS.DELETE_TOKEN)
	@UseGuards(AccessTokenGuard)
	async deleteToken(@Param("id") tokenId: string) {
		return this._tokensService.deleteToken(tokenId);
	}
}
