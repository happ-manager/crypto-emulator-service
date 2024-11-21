import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTransactionDto {
	@Field()
	poolAddress: string;
}
