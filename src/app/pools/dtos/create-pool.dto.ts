import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePoolDto {
	@Field()
	address: string;
}
