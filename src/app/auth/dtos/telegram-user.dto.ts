import { Field, InputType } from "@nestjs/graphql";

import { IsNotEmpty, IsOptional, IsString } from "../../shared/validators/override.validator";
import type { ITelegramUser } from "../interfaces/telegram-user.interface";

@InputType()
export class TelegramUserDto implements ITelegramUser {
	@Field(() => Number)
	@IsNotEmpty()
	id: number;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	is_bot: boolean;

	@Field(() => String)
	@IsString()
	first_name: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	username?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	last_name?: string;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	is_premium?: true;

	@Field(() => String, { nullable: true })
	@IsOptional()
	language_code?: string;

	@Field(() => Boolean, { nullable: true })
	@IsOptional()
	added_to_attachment_menu?: true;

	@Field(() => String)
	@IsString()
	phone: string;
}
