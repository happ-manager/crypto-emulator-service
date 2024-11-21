import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { BaseEntity as _BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import type { IBase } from "../interfaces/base.interface";

@ObjectType()
export class BaseEntity extends _BaseEntity implements IBase {
	@Field(() => ID)
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Field(() => GraphQLISODateTime)
	@CreateDateColumn({ type: "timestamptz" })
	createdAt: Date;

	@Field(() => GraphQLISODateTime)
	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt: Date;
}
