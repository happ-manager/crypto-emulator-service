import { Resolver } from "@nestjs/graphql";

import { ChannelEntity } from "../entities/channel.entity";

@Resolver(() => ChannelEntity)
export class ChannelResolver {}
