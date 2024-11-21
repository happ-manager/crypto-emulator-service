import { Injectable } from "@nestjs/common";

import { TransactionsService } from "../services/transactions.service";

export interface ITransactiosnLoader {}

@Injectable()
export class TransactionsLoader {
	constructor(private readonly _transactiosnService: TransactionsService) {}
}
