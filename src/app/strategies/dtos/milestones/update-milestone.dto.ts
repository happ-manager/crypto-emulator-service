import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateMilestoneDto {
	@Field(() => ID)
	id: string;
}
