import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateChannelDto {
	@Field()
	telegramId?: string;
}
