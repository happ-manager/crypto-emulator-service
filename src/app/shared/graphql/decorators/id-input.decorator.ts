import { Field, InputType } from "@nestjs/graphql";

import type { IIdInput } from "../interfaces/id-input.interface";

@InputType()
export class IdInput implements IIdInput {
	@Field()
	id: string;
}
