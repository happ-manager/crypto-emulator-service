import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateCredentialDto {
	@Field()
	solscanHeaders?: string;
}
