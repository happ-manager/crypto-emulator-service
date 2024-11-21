import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateChannelDto {
	@Field(() => ID)
	id: string;
}
