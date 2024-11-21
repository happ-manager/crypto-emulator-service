import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class EmailAuthDto {
	@Field()
	email: string;

	@Field()
	password: string;
}
