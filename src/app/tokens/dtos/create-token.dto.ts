import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTokenDto {
	@Field()
	name: string;
}
