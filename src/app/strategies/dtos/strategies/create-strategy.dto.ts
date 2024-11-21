import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateStrategyDto {
	@Field()
	name: string;
}
