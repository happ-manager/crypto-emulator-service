import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { DeepPartial, FindManyOptions, FindOneOptions } from "typeorm";
import { Repository } from "typeorm";

import { LoggerService } from "../../libs/logger";
import { ErrorsEnum } from "../../shared/enums/errors.enum";
import { getPage } from "../../shared/utils/get-page.util";
import { ChannelEntity } from "../entities/channel.entity";
import type { IChannel } from "../interfaces/channel.interface";

@Injectable()
export class ChannelsService {
	constructor(
		@InjectRepository(ChannelEntity) private readonly _channelsRepository: Repository<ChannelEntity>,
		private readonly _loggerService: LoggerService
	) {}

	async getChannel(options?: FindOneOptions<ChannelEntity>) {
		return this._channelsRepository.findOne(options);
	}

	async getChannels(options?: FindManyOptions<ChannelEntity>) {
		const [data, count] = await this._channelsRepository.findAndCount(options);

		return { data, totalCount: count, page: getPage(options) };
	}

	async createChannel(channel: DeepPartial<IChannel>) {
		try {
			const savedChannel = await this._channelsRepository.save(channel);

			return await this._channelsRepository.findOne({ where: { id: savedChannel.id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async updateChannel(id: string, channel: DeepPartial<IChannel>) {
		try {
			await this._channelsRepository.save({ id, ...channel });
			return await this._channelsRepository.findOne({ where: { id } });
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}

	async deleteChannel(id: string) {
		try {
			await this._channelsRepository.delete(id);
			return { deleted: true };
		} catch (error) {
			this._loggerService.error(error);
			throw new InternalServerErrorException(ErrorsEnum.InternalServerError);
		}
	}
}
