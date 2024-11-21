import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateConditionDto {
	@Field(() => ID)
	id: string;
}
