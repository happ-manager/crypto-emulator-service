import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdatePoolDto {
	@Field(() => ID)
	id: string;
}
