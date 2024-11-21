import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateChannelDto } from "../dtos/create-channel.dto";
import { UpdateChannelDto } from "../dtos/update-channel.dto";
import { ChannelEntity, PaginatedChannels } from "../entities/channel.entity";
import { ChannelsService } from "../services/channels.service";

@Resolver(() => ChannelEntity)
export class ChannelsResolver {
	constructor(private readonly _channelsService: ChannelsService) {}

	@Query(() => PaginatedChannels)
	async channels(@Args() args: PaginationArgs) {
		return this._channelsService.getChannels(args);
	}

	@Query(() => ChannelEntity)
	async channel(@Args() args: IdArgs) {
		const { id } = args;
		return this._channelsService.getChannel({ where: { id } });
	}

	@Mutation(() => ChannelEntity)
	async createChannel(@Args("channel") channel: CreateChannelDto) {
		return this._channelsService.createChannel(channel);
	}

	@Mutation(() => ChannelEntity)
	async updateChannel(@Args("channel") channel: UpdateChannelDto) {
		const { id, ...data } = channel;
		return this._channelsService.updateChannel(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteChannel(@Args("id") id: string) {
		return this._channelsService.deleteChannel(id);
	}
}
