import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

import { JwtService } from "../../libs/jwt";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { UsersService } from "../../users/services/users.service";

@Injectable()
export class GqlJwtGuard implements CanActivate {
	constructor(
		private readonly _jwtService: JwtService,
		private readonly _usersService: UsersService
	) {}

	async canActivate(context: ExecutionContext) {
		const ctx = GqlExecutionContext.create(context).getContext();
		const { authorization } = ctx.req.headers;

		if (!authorization) {
			throw new UnauthorizedException(ErrorsEnum.AuthorizationHeaderIsMissing);
		}

		const [_, token] = authorization.split(" ");

		if (!token) {
			throw new UnauthorizedException(ErrorsEnum.TokenIsMissing);
		}

		let payload: any;

		try {
			payload = this._jwtService.verify(token);
		} catch {
			throw new UnauthorizedException(ErrorsEnum.InvalidToken);
		}

		const user = await this._usersService.getUser({ where: { id: payload?.id } });

		if (!user) {
			throw new UnauthorizedException(ErrorsEnum.UserNotFound);
		}

		ctx.user = user;

		return true;
	}
}
