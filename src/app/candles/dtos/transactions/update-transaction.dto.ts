import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTransactionDto {
	@Field(() => ID)
	id: string;
}
