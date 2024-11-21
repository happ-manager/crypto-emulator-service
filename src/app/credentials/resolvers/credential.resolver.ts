import { Resolver } from "@nestjs/graphql";

import { CredentialEntity } from "../entities/credential.entity";

@Resolver(() => CredentialEntity)
export class CredentialResolver {}
