import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { WalletEntity } from "../entities/wallet.entity";

@Injectable()
export class AccessWalletGuard implements CanActivate {
	constructor(@InjectRepository(WalletEntity) private readonly _channelsRepository: Repository<WalletEntity>) {}

	async canActivate(_context: ExecutionContext) {
		return true;
	}
}
