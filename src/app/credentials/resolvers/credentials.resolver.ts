import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLVoid } from "graphql-scalars";

import { IdArgs } from "../../shared/graphql/decorators/id-args.decorator";
import { PaginationArgs } from "../../shared/graphql/decorators/pagination-args.decorator";
import { CreateCredentialDto } from "../dtos/create-credential.dto";
import { UpdateCredentialDto } from "../dtos/update-credential.dto";
import { CredentialEntity, PaginatedCredentials } from "../entities/credential.entity";
import { CredentialsService } from "../services/credentials.service";

@Resolver(() => CredentialEntity)
export class CredentialsResolver {
	constructor(private readonly _credentialsService: CredentialsService) {}

	@Query(() => PaginatedCredentials)
	async credentials(@Args() args: PaginationArgs) {
		return this._credentialsService.getCredentials(args);
	}

	@Query(() => CredentialEntity)
	async credential(@Args() args: IdArgs) {
		const { id } = args;
		return this._credentialsService.getCredential({ where: { id } });
	}

	@Mutation(() => CredentialEntity)
	async createCredential(@Args("credential") credential: CreateCredentialDto) {
		return this._credentialsService.createCredential(credential);
	}

	@Mutation(() => CredentialEntity)
	async updateCredential(@Args("credential") credential: UpdateCredentialDto) {
		const { id, ...data } = credential;
		return this._credentialsService.updateCredential(id, data);
	}

	@Mutation(() => GraphQLVoid)
	async deleteCredential(@Args("id") id: string) {
		return this._credentialsService.deleteCredential(id);
	}
}
