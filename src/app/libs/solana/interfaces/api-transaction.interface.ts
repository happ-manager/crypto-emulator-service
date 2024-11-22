export interface IApiTransaction {
	description: string;
	type: string;
	source: string;
	fee: number;
	feePayer: string;
	signature: string;
	slot: number;
	timestamp: number;
	tokenTransfers: TokenTransfer[];
	nativeTransfers: NativeTransfer[];
	accountData: AccountData[];
	transactionError: any;
	instructions: Instruction[];
	events: any;
}

interface TokenTransfer {
	fromTokenAccount: string;
	toTokenAccount: string;
	fromUserAccount: string;
	toUserAccount: string;
	tokenAmount: number;
	mint: string;
	tokenStandard: string;
}

interface NativeTransfer {
	fromUserAccount: string;
	toUserAccount: string;
	amount: number;
}

interface AccountData {
	account: string;
	nativeBalanceChange: number;
	tokenBalanceChanges: TokenBalanceChange[];
}

interface TokenBalanceChange {
	userAccount: string;
	tokenAccount: string;
	rawTokenAmount: {
		tokenAmount: string;
		decimals: number;
	};
	mint: string;
}

interface Instruction {
	accounts: string[];
	data: string;
	programId: string;
	innerInstructions: InnerInstruction[];
}

interface InnerInstruction {
	accounts: string[];
	data: string;
	programId: string;
}
