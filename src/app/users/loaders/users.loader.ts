import { Injectable } from "@nestjs/common";

import { UsersService } from "../services/users.service";

export interface IUsersLoader {}

@Injectable()
export class UsersLoader {
	constructor(private readonly _usersService: UsersService) {}
}
