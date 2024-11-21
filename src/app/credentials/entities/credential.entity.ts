import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

import { BaseEntity } from "../../shared/entities/base.entity";
import { Paginated } from "../../shared/models/paginated.model";
import { CREDENTIALS } from "../constants/credentials.constant";
import type { ICredential } from "../interfaces/credential.interface";

@ObjectType()
@Entity({ name: CREDENTIALS })
export class CredentialEntity extends BaseEntity implements ICredential {
	@Field()
	@Column()
	name: string;

	@Field()
	@Column()
	solscanHeaders: string;
}

@ObjectType()
export class PaginatedCredentials extends Paginated(CredentialEntity) {}
