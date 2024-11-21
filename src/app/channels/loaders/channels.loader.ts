import { Injectable } from "@nestjs/common";

import { ChannelsService } from "../services/channels.service";

export interface IChannelsLoader {}

@Injectable()
export class ChannelsLoader {
	constructor(private readonly _channelsService: ChannelsService) {}
}
