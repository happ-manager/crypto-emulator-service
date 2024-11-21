import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";

import { IUser } from "../../users/interfaces/user.interface";
import { UserGql } from "../decorators/user.decorator";
import { AuthTokensDto } from "../dtos/auth-tokens.dto";
import { EmailAuthDto } from "../dtos/email-auth.dto";
import { TelegramUserDto } from "../dtos/telegram-user.dto";
import { GqlJwtGuard } from "../guards/gql-jwt.guard";
import { AuthService } from "../services/auth.service";

@Resolver(() => AuthTokensDto)
export class AuthResolver {
	constructor(private readonly _authService: AuthService) {}

	@Mutation(() => AuthTokensDto)
	@UseGuards(GqlJwtGuard)
	async me(@UserGql() user?: IUser) {
		return this._authService.me(user);
	}

	@Mutation(() => AuthTokensDto)
	async verifyCode(@Args("verificationCode") verificationCode: string, @UserGql() user: IUser) {
		return this._authService.verifyCode(user, verificationCode);
	}

	@Mutation(() => AuthTokensDto)
	async refreshTokens(@Args("refreshToken") refreshToken: string) {
		return this._authService.refreshTokens(refreshToken);
	}

	@Mutation(() => AuthTokensDto)
	async signUp(@Args("emailAuth") emailAuth: EmailAuthDto) {
		return this._authService.signUp(emailAuth);
	}

	@Mutation(() => AuthTokensDto)
	async signIn(@Args("emailAuth") emailAuth: EmailAuthDto) {
		return this._authService.signIn(emailAuth);
	}

	@Mutation(() => AuthTokensDto)
	async signUpTelegram(@Args("telegramUser") telegramUser: TelegramUserDto) {
		return this._authService.signUpTelegram(telegramUser);
	}

	@Mutation(() => AuthTokensDto)
	async signInTelegram(@Args("telegramId") telegramId: string) {
		return this._authService.signInTelegram(telegramId);
	}
}
