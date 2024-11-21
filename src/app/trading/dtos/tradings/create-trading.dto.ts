import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTradingDto {
	@Field()
	price: string;
}
