import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class CreateConditionDto {
	@Field(() => ID)
	id: string;
}
