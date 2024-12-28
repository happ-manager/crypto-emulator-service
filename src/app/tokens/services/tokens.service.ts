import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { IsNull } from "typeorm";
import { Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { LoggerService } from "../../libs/logger";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { TokenEntity } from "../entities/token.entity";
import type { IToken } from "../interfaces/token.interface";

@Injectable()
export class TokensService {
	constructor(
		@InjectRepository(TokenEntity) private readonly _tokensRepository: Repository<TokenEntity>,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService,
		private readonly _solanaService: SolanaService
	) {}

	@Cron("*/30 * * * * *")
	async handleTokensWithoutNames() {
		const { data } = await this.getTokens({
			where: {
				name: IsNull()
			}
		});

		for (const token of data) {
			const tokenAsset = await this._solanaService.getAsset(token.address);

			if (!tokenAsset?.content?.metadata) {
				return;
			}

			const { name, symbol } = tokenAsset.content.metadata;

			await this.updateToken(token.id, { name, symbol });
		}
	}

	async getToken(options?: FindOneOptions<IToken>) {
		return this._tokensRepository.findOne(options);
	}

	async getTokens(options?: FindManyOptions<IToken>) {
		const [data, count] = await this._tokensRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createToken(token: DeepPartial<IToken>) {
		try {
			const savedToken = await this._tokensRepository.save(token);

			const findedToken = await this._tokensRepository.findOne({ where: { id: savedToken.id } });

			this._eventsService.emit(EventsEnum.TOKEN_CREATED, findedToken);

			return findedToken;
		} catch (error) {
			this._loggerService.error(error, "createToken");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateToken(id: string, token: DeepPartial<IToken>) {
		try {
			await this._tokensRepository.save({ id, ...token });
			const findedToken = await this._tokensRepository.findOne({ where: { id } });

			this._eventsService.emit(EventsEnum.TOKEN_UPDATED, findedToken);

			return findedToken;
		} catch (error) {
			this._loggerService.error(error, "updateToken");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteToken(id: string) {
		try {
			await this._tokensRepository.delete(id);

			this._eventsService.emit(EventsEnum.TOKEN_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteToken");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
