import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { USERS } from "../constants/users.constant";
import { USERS_ENDPOINTS } from "../constants/users-endpoints.constant";
import { AccessUserGuard } from "../guards/access-user.guard";
import type { IUser } from "../interfaces/user.interface";
import { UsersService } from "../services/users.service";

@ApiTags(USERS)
@Controller(USERS_ENDPOINTS.BASE)
export class UsersController {
	constructor(private readonly _usersService: UsersService) {}

	@Get(USERS_ENDPOINTS.GET_USER)
	async getUser(@Param("id") id: string) {
		return this._usersService.getUser({ where: { id } });
	}

	@Get(USERS_ENDPOINTS.GET_USERS)
	async getUsers() {
		return this._usersService.getUsers();
	}

	@Post(USERS_ENDPOINTS.CREATE_USER)
	@UseGuards(AccessUserGuard)
	async createUser(@Body() user: Partial<IUser>) {
		return this._usersService.createUser(user);
	}

	@Patch(USERS_ENDPOINTS.UPDATE_USER)
	@UseGuards(AccessUserGuard)
	async updateUser(@Param("id") userId: string, @Body() user: Partial<IUser>) {
		return this._usersService.updateUser(userId, user);
	}

	@Delete(USERS_ENDPOINTS.DELETE_USER)
	@UseGuards(AccessUserGuard)
	async deleteUser(@Param("id") userId: string) {
		return this._usersService.deleteUser(userId);
	}
}
