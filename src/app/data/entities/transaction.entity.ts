import { BaseEntity, ITransaction } from "@happ-manager/crypto-api";
import { Column, Entity } from "typeorm";

@Entity({ name: "transactions" })
export class TransactionEntity extends BaseEntity implements ITransaction {
	@Column()
	poolAddress: string;

	@Column("timestamptz")
	date: Date;

	@Column("decimal")
	price: number;

	@Column("decimal")
	nextPrice: number;

	@Column()
	signature: string;

	@Column()
	author: string;
}
