import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateStrategyDto {
	@Field(() => ID)
	id: string;
}
