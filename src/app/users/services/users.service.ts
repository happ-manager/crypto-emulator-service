import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { UserEntity } from "../entities/user.entity";
import type { IUser } from "../interfaces/user.interface";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity) private readonly _usersRepository: Repository<UserEntity>,
		private readonly _loggerService: LoggerService
	) {}

	async getUser(options?: FindOneOptions<UserEntity>) {
		return this._usersRepository.findOne(options);
	}

	async getUsers(options?: FindManyOptions<UserEntity>) {
		const [data, count] = await this._usersRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createUser(user: DeepPartial<IUser>) {
		try {
			const savedUser = await this._usersRepository.save(user);

			return await this._usersRepository.findOne({ where: { id: savedUser.id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateUser(id: string, user: DeepPartial<IUser>) {
		try {
			await this._usersRepository.save({ id, ...user });
			return await this._usersRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteUser(id: string) {
		try {
			await this._usersRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
