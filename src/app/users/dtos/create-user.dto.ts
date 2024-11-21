import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateUserInput {
	@Field()
	tel: string;

	@Field()
	verificationCode?: string;
}
