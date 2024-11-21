import type { NestMiddleware } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { JwtService } from "../../../libs/jwt";
import type { IUser } from "../../../users/interfaces/user.interface";
import { UsersService } from "../../../users/services/users.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private readonly _usersService: UsersService,
		private readonly _jwtService: JwtService
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const accessToken = req.headers["authorization"];

		const jwtToken = (accessToken || "").replace("Bearer ", "");
		const decodedUser: IUser | undefined = this._jwtService.decode(jwtToken);

		req["user"] = decodedUser ? await this._usersService.getUser({ where: { id: decodedUser.id } }) : null;

		next();
	}
}
