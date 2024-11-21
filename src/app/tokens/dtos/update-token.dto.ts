import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTokenDto {
	@Field(() => ID)
	id: string;
}
