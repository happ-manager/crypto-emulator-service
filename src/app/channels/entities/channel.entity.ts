import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { VerificationStatusEnum } from "../../users/enums/verification-status.enum";
import { CHANNELS } from "../constants/channels.constant";
import type { IChannel } from "../interfaces/channel.interface";

@ObjectType()
@Entity({ name: CHANNELS })
export class ChannelEntity extends BaseEntity implements IChannel {
	@Field(() => VerificationStatusEnum, { defaultValue: VerificationStatusEnum.NOT_VERIFIED })
	@Column("enum", { enum: VerificationStatusEnum, default: VerificationStatusEnum.NOT_VERIFIED })
	verificationStatus: VerificationStatusEnum;

	@Field(() => String, { nullable: true })
	@Column({ unique: true, nullable: true })
	telegramId?: string;
}

@ObjectType()
export class PaginatedChannels extends Paginated(ChannelEntity) {}
