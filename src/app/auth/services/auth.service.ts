import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "src/app/libs/jwt";

import { CryptoService } from "../../libs/crypto";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getRandom } from "../../shared/utils/get-random.util";
import { VerificationStatusEnum } from "../../users/enums/verification-status.enum";
import type { IUser } from "../../users/interfaces/user.interface";
import { UsersService } from "../../users/services/users.service";
import type { EmailAuthDto } from "../dtos/email-auth.dto";
import type { ITelegramUser } from "../interfaces/telegram-user.interface";

@Injectable()
export class AuthService {
	constructor(
		private readonly _usersService: UsersService,
		private readonly _jwtService: JwtService,
		private readonly _cryptoService: CryptoService
	) {}

	me(user: IUser) {
		return this._jwtService.generateTokens(user);
	}

	refreshTokens(refreshToken: string) {
		return this._jwtService.refreshTokens(refreshToken);
	}

	async signUp(emailAuth: EmailAuthDto) {
		const { email, password } = emailAuth;

		const findedUser = await this._usersService.getUser({ where: { email } });

		if (findedUser) {
			throw new UnauthorizedException(ErrorsEnum.UserAlreadyExist);
		}

		const isPasswordEncrypted = this._cryptoService.check(password);

		if (!isPasswordEncrypted) {
			throw new UnauthorizedException(ErrorsEnum.InvalidEncryption);
		}

		const user = await this._usersService.createUser({
			email,
			password,
			verificationCode: getRandom(1000, 9999).toString(),
			verificationStatus: VerificationStatusEnum.NOT_VERIFIED
		});

		return this._jwtService.generateTokens(user);
	}

	async signIn(emailAuth: EmailAuthDto) {
		const { email } = emailAuth;

		const findedUser = await this._usersService.getUser({ where: { email } });

		if (!findedUser) {
			throw new UnauthorizedException(ErrorsEnum.UserNotFound);
		}

		return this._jwtService.generateTokens(findedUser);
	}

	async verifyCode(user: IUser, verificationCode: string) {
		if (user.verificationCode !== verificationCode) {
			throw new UnauthorizedException(ErrorsEnum.Forbidden);
		}

		const updatedUser = await this._usersService.updateUser(user.id, {
			verificationCode: null,
			verificationStatus: VerificationStatusEnum.VERIFIED
		});

		return this._jwtService.generateTokens(updatedUser);
	}

	async signUpTelegram(telegramUser: ITelegramUser) {
		const { id, first_name, last_name, phone } = telegramUser;
		const telegramId = id.toString();

		const existedUser = await this._usersService.getUser({ where: { tel: phone } });

		if (existedUser) {
			const savedUser = await this._usersService.updateUser(existedUser.id, { telegramId });

			return this._jwtService.generateTokens(savedUser);
		}

		const newUser = await this._usersService.createUser({
			telegramId,
			tel: phone,
			name: `${first_name || ""} ${last_name || ""}`,
			verificationStatus: VerificationStatusEnum.VERIFIED
		});

		return this._jwtService.generateTokens(newUser);
	}

	async signInTelegram(telegramId: string) {
		const existedUser = await this._usersService.getUser({ where: { telegramId } });

		if (existedUser) {
			return this._jwtService.generateTokens(existedUser);
		}

		throw new UnauthorizedException(ErrorsEnum.UserNotExist);
	}
}
