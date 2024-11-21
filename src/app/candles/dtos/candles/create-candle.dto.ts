import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateCandleDto {
	@Field()
	poolAddress: string;
}
