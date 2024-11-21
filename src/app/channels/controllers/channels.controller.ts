import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { CHANNELS } from "../constants/channels.constant";
import { CHANNELS_ENDPOINTS } from "../constants/channels-endpoints.constant";
import { AccessChannelGuard } from "../guards/access-channel.guard";
import type { IChannel } from "../interfaces/channel.interface";
import { ChannelsService } from "../services/channels.service";

@ApiTags(CHANNELS)
@Controller(CHANNELS_ENDPOINTS.BASE)
export class ChannelsController {
	constructor(private readonly _channelsService: ChannelsService) {}

	@Get(CHANNELS_ENDPOINTS.GET_CHANNEL)
	async getChannel(@Param("id") id: string) {
		return this._channelsService.getChannel({ where: { id } });
	}

	@Get(CHANNELS_ENDPOINTS.GET_CHANNELS)
	async getChannels() {
		return this._channelsService.getChannels();
	}

	@Post(CHANNELS_ENDPOINTS.CREATE_CHANNEL)
	@UseGuards(AccessChannelGuard)
	async createChannel(@Body() channel: Partial<IChannel>) {
		return this._channelsService.createChannel(channel);
	}

	@Patch(CHANNELS_ENDPOINTS.UPDATE_CHANNEL)
	@UseGuards(AccessChannelGuard)
	async updateChannel(@Param("id") channelId: string, @Body() channel: Partial<IChannel>) {
		return this._channelsService.updateChannel(channelId, channel);
	}

	@Delete(CHANNELS_ENDPOINTS.DELETE_CHANNEL)
	@UseGuards(AccessChannelGuard)
	async deleteChannel(@Param("id") channelId: string) {
		return this._channelsService.deleteChannel(channelId);
	}
}
