import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { In, Repository } from "typeorm";

import { EventsEnum } from "../../events/enums/events.enum";
import { EventsService } from "../../events/services/events.service";
import { DexToolsService } from "../../libs/dex-tools";
import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { sleep } from "../../shared/utils/sleep.util";
import { ISignal } from "../../signals/interfaces/signal.interface";
import { TokenEntity } from "../entities/token.entity";
import type { IToken } from "../interfaces/token.interface";

@Injectable()
export class TokensService {
	private readonly _signals: ISignal[] = [];

	constructor(
		@InjectRepository(TokenEntity) private readonly _tokensRepository: Repository<TokenEntity>,
		private readonly _dexToolsService: DexToolsService,
		private readonly _eventsService: EventsService,
		private readonly _loggerService: LoggerService
	) {}

	private async _getTokenInfo(token: DeepPartial<IToken>) {
		const { tokenAddress, poolAddress, name } = token;

		const pairs = await this._dexToolsService.searchPair(tokenAddress || poolAddress || name);

		if (!pairs) {
			this._loggerService.error(`Cannot find pair for: ${tokenAddress}, ${poolAddress}, ${name}`);
			return;
		}

		const filteredPairs = pairs.filter((pair) =>
			tokenAddress ? tokenAddress === pair.id.token : poolAddress ? poolAddress === pair.id.pair : true
		);
		const [pair] = filteredPairs.sort((a, b) => b.metrics.liquidity - a.metrics.liquidity);

		if (!pair) {
			this._loggerService.error(`Cannot find pair for: ${token.name}, ${token.tokenAddress}, ${token.poolAddress}`);
			return;
		}

		return {
			name: pair.name,
			symbol: pair.symbol,
			tokenAddress: pair.id.token,
			poolAddress: pair.id.pair,
			chain: pair.id.chain,
			dexToolsPairId: pair.redirectToPool || pair.id.pair,
			signals: token.signals
		} as Partial<IToken>;
	}

	@OnEvent(EventsEnum.SIGNAL_CREATED)
	async onSignalCreate(signal: ISignal) {
		await this.createToken({
			name: signal.tokenName,
			tokenAddress: signal.tokenAddress,
			poolAddress: signal.poolAddress,
			signals: [signal]
		});
	}

	@OnEvent(EventsEnum.SIGNALS_CREATED)
	async onSignalsCreate(signals: ISignal[]) {
		const tokensToCreate: DeepPartial<IToken>[] = signals.map((signal) => ({
			name: signal.tokenName,
			tokenAddress: signal.tokenAddress,
			poolAddress: signal.poolAddress,
			signal
		}));

		await this.createTokens(tokensToCreate);
	}

	async getToken(options?: FindOneOptions<IToken>) {
		return this._tokensRepository.findOne(options);
	}

	async getTokens(options?: FindManyOptions<IToken>) {
		const [data, count] = await this._tokensRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createToken(token: DeepPartial<IToken>) {
		const { name, tokenAddress, poolAddress } = token;

		const existToken = await this._tokensRepository.findOneBy([{ name }, { tokenAddress }, { poolAddress }]);

		if (existToken?.dexToolsPairId) {
			return existToken;
		}

		const tokenInfo = await this._getTokenInfo(token);

		if (!tokenInfo) {
			return;
		}

		try {
			const savedToken = await this._tokensRepository.save(tokenInfo);

			const findedToken = await this._tokensRepository.findOne({ where: { id: savedToken.id } });

			this._eventsService.emit(EventsEnum.TOKEN_CREATED, findedToken);

			return findedToken;
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async createTokens(tokens: DeepPartial<IToken>[]) {
		const tokensToCreate: DeepPartial<IToken>[] = [];

		for (const token of tokens) {
			const { name, tokenAddress, poolAddress } = token;
			const existToken = await this._tokensRepository.findOneBy([{ name }, { tokenAddress }, { poolAddress }]);

			if (existToken?.dexToolsPairId) {
				tokensToCreate.push(existToken);
				continue;
			}

			const tokenInfo = await this._getTokenInfo(token);

			if (!tokenInfo) {
				continue;
			}

			await sleep(100);

			tokensToCreate.push(tokenInfo);
		}

		try {
			const savedTokens = await this._tokensRepository.save(tokensToCreate);
			const savedIds = savedTokens.map((savedToken) => savedToken.id);

			const findedTokens = await this._tokensRepository.find({ where: { id: In(savedIds) } });

			this._eventsService.emit(EventsEnum.TOKENS_CREATED, findedTokens);

			return findedTokens;
		} catch (error) {
			this._loggerService.error(error);
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
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteToken(id: string) {
		try {
			await this._tokensRepository.delete(id);

			this._eventsService.emit(EventsEnum.TOKEN_DELETED, id);

			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
