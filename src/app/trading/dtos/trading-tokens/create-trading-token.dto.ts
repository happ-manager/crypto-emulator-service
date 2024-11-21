import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTradingTokenDto {
	@Field()
	id: string;
}
