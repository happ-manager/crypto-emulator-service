import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateUserInput } from "../dtos/create-user.dto";
import { UpdateUserInput } from "../dtos/update-user.dto";
import { PaginatedUsers, UserEntity } from "../entities/user.entity";
import { UsersService } from "../services/users.service";

@Resolver(() => UserEntity)
export class UsersResolver {
	constructor(private readonly _usersService: UsersService) {}

	@Query(() => PaginatedUsers)
	async users(@Args() args: PaginationArgs) {
		return this._usersService.getUsers(args);
	}

	@Query(() => UserEntity)
	async user(@Args() args: IdArgs) {
		const { id } = args;
		return this._usersService.getUser({ where: { id } });
	}

	@Mutation(() => UserEntity)
	async createUser(@Args("user") user: CreateUserInput) {
		return this._usersService.createUser(user);
	}

	@Mutation(() => UserEntity)
	async updateUser(@Args("user") user: UpdateUserInput) {
		const { id, ...data } = user;
		return this._usersService.updateUser(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteUser(@Args("id") id: string) {
		return this._usersService.deleteUser(id);
	}
}
