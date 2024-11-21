import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateCredentialDto {
	@Field(() => ID)
	id: string;
}
