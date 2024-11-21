import { Injectable } from "@nestjs/common";
import { JwtService as _JwtService } from "@nestjs/jwt";
import { instanceToPlain } from "class-transformer";

import { ACCESS_TOKEN, EXPIRES_IN, REFRESH_TOKEN } from "../../../auth/constants/auth.constant";

@Injectable()
export class JwtService {
	constructor(private readonly _jwtService: _JwtService) {}

	generateTokens(payload: Buffer | object | string) {
		const expiresIn = 60;

		if (typeof payload === "object") {
			delete payload["exp"];
			delete payload["iat"];
		}

		return {
			[ACCESS_TOKEN]: this._jwtService.sign(instanceToPlain(payload), { expiresIn }),
			[REFRESH_TOKEN]: this._jwtService.sign(instanceToPlain(payload), { expiresIn: "1y" }),
			[EXPIRES_IN]: expiresIn
		};
	}

	refreshTokens(refreshToken: string) {
		const payload = this.verify(refreshToken);

		return this.generateTokens(payload);
	}

	decode<T>(jwt: string): T {
		return this._jwtService.decode(jwt);
	}

	verify(jwt: string) {
		return this._jwtService.verify(jwt);
	}
}
