import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ChannelEntity } from "../entities/channel.entity";

@Injectable()
export class AccessChannelGuard implements CanActivate {
	constructor(@InjectRepository(ChannelEntity) private readonly _channelsRepository: Repository<ChannelEntity>) {}

	async canActivate(_context: ExecutionContext) {
		return true;
	}
}
