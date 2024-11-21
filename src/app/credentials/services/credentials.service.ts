import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { CredentialEntity } from "../entities/credential.entity";
import type { ICredential } from "../interfaces/credential.interface";

@Injectable()
export class CredentialsService {
	constructor(
		@InjectRepository(CredentialEntity) private readonly _credentialsRepository: Repository<CredentialEntity>,
		private readonly _loggerService: LoggerService
	) {}

	async getCredential(options?: FindOneOptions<CredentialEntity>) {
		return this._credentialsRepository.findOne(options);
	}

	async getCredentials(options?: FindManyOptions<CredentialEntity>) {
		const [data, count] = await this._credentialsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createCredential(credential: DeepPartial<ICredential>) {
		try {
			const savedCredential = await this._credentialsRepository.save(credential);

			return await this._credentialsRepository.findOne({ where: { id: savedCredential.id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateCredential(id: string, credential: DeepPartial<ICredential>) {
		try {
			await this._credentialsRepository.save({ id, ...credential });
			return await this._credentialsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteCredential(id: string) {
		try {
			await this._credentialsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
