import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateTradingDto {
	@Field(() => ID)
	id: string;
}
