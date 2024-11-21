import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateUserInput {
	@Field(() => ID)
	id: string;

	@Field()
	tel: string;

	@Field()
	verificationCode?: string;
}
