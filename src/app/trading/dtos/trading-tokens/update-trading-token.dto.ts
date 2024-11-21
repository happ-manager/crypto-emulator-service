import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTradingTokenDto {
	@Field(() => ID)
	id: string;
}
