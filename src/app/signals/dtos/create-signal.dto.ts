import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSignalDto {
	@Field()
	tokenName: string;
}
