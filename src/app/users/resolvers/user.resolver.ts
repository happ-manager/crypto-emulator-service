import { Resolver } from "@nestjs/graphql";

import { UserEntity } from "../entities/user.entity";

@Resolver(() => UserEntity)
export class UserResolver {}
