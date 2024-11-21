import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "../entities/user.entity";

@Injectable()
export class AccessUserGuard implements CanActivate {
	constructor(@InjectRepository(UserEntity) private readonly _usersRepository: Repository<UserEntity>) {}

	async canActivate(_context: ExecutionContext) {
		return true;
	}
}
