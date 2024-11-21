import { Field, ID, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateSignalDto {
	@Field(() => ID)
	id: string;
}
