import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CredentialEntity } from "../entities/credential.entity";

@Injectable()
export class AccessCredentialGuard implements CanActivate {
	constructor(@InjectRepository(CredentialEntity) private readonly _channelsRepository: Repository<CredentialEntity>) {}

	async canActivate(_context: ExecutionContext) {
		return true;
	}
}
