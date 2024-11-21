import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateWalletDto {
	@Field(() => ID)
	id: string;
}
