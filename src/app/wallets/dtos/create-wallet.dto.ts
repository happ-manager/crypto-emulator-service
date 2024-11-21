import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateWalletDto {
	@Field()
	address?: string;
}
