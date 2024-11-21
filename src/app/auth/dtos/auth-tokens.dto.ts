import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuthTokensDto {
	@Field()
	accessToken: string;

	@Field()
	refreshToken: string;

	@Field()
	expiresIn: number;
}
