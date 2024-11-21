import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateConditionsGroupDto {
	@Field(() => ID)
	id: string;
}
