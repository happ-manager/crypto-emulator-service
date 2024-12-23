import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { CryptoService } from "../../libs/crypto";
import { LoggerService } from "../../libs/logger";
import { SolanaService } from "../../libs/solana/services/solana.service";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { WalletEntity } from "../entities/wallet.entity";
import type { IWallet } from "../interfaces/wallet.interface";

@Injectable()
export class WalletsService {
	constructor(
		@InjectRepository(WalletEntity) private readonly _walletsRepository: Repository<WalletEntity>,
		private readonly _loggerService: LoggerService,
		private readonly _cryptoService: CryptoService,
		private readonly _solanaService: SolanaService
	) {}

	async getWallet(options?: FindOneOptions<WalletEntity>) {
		return this._walletsRepository.findOne(options);
	}

	async getWallets(options?: FindManyOptions<WalletEntity>) {
		const [data, count] = await this._walletsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createWallet(wallet: DeepPartial<IWallet>) {
		if (wallet.secret && !this._cryptoService.check(wallet.secret)) {
			throw new InternalServerErrorException(ErrorsEnum.InvalidEncryption);
		}

		try {
			const savedWallet = await this._walletsRepository.save(wallet);

			return await this._walletsRepository.findOne({ where: { id: savedWallet.id } });
		} catch (error) {
			this._loggerService.error(error, "createWallet");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateWallet(id: string, wallet: DeepPartial<IWallet>) {
		if (wallet.secret && !this._cryptoService.check(wallet.secret)) {
			throw new InternalServerErrorException(ErrorsEnum.InvalidEncryption);
		}

		try {
			await this._walletsRepository.save({ id, ...wallet });
			return await this._walletsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error, "updateWallet");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteWallet(id: string) {
		try {
			await this._walletsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error, "deleteWallet");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async wrapSolana(id: string, amount: number) {
		try {
			const findedWallet = await this._walletsRepository.findOne({ where: { id } });
			const secret = this._cryptoService.decrypt(findedWallet.secret);
			const owner = Keypair.fromSecretKey(bs58.decode(secret));

			const signature = await this._solanaService.wrap({
				amount,
				owner
			});

			return { signature };
		} catch (error) {
			this._loggerService.error(error, "wrapSolana");
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
