import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateConditionsGroupDto {
	@Field()
	name: string;
}
