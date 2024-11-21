import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { USERS } from "../constants/users.constant";
import { VerificationStatusEnum } from "../enums/verification-status.enum";
import type { IUser } from "../interfaces/user.interface";

@ObjectType()
@Entity({ name: USERS })
export class UserEntity extends BaseEntity implements IUser {
	@Field(() => VerificationStatusEnum, { defaultValue: VerificationStatusEnum.NOT_VERIFIED })
	@Column("enum", { enum: VerificationStatusEnum, default: VerificationStatusEnum.NOT_VERIFIED })
	verificationStatus: VerificationStatusEnum;

	@Field({ nullable: true })
	@Column({ nullable: true })
	verificationCode?: string;

	@Field({ nullable: true })
	@Column({ unique: true, nullable: true })
	email?: string;

	@Field({ nullable: true })
	@Column({ unique: true, nullable: true })
	password?: string;

	@Field({ nullable: true })
	@Column({ unique: true, nullable: true })
	tel?: string;

	@Field(() => String, { nullable: true })
	@Column({ unique: true, nullable: true })
	telegramId?: string;
}

@ObjectType()
export class PaginatedUsers extends Paginated(UserEntity) {}
