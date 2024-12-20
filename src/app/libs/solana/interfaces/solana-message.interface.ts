export interface ISolanaMessage {
	jsonrpc: string;
	method: string;
	params: {
		subscription: number;
		result: TransactionNotificationResult;
		error?: any;
	};
	error?: any;
}

interface TransactionNotificationResult {
	transaction: Transaction;
	signature: string;
	slot: number;
}

interface Transaction {
	transaction: TransactionData;
	meta: MetaData;
	version: number | string;
}

interface TransactionData {
	signatures: string[];
	message: MessageDetails;
}

interface MessageDetails {
	accountKeys: AccountKey[];
	recentBlockhash: string;
	instructions: Instruction[];
	addressTableLookups?: any[];
}

interface AccountKey {
	pubkey: string;
	writable: boolean;
	signer: boolean;
	source: string;
}

export interface Instruction {
	program?: string;
	programId: string;
	parsed?: ParsedInstruction;
	stackHeight: number | null;
	accounts?: string[];
	data?: string;
}

interface ParsedInstruction {
	info: ParsedInfo;
	type: string;
}

interface ParsedInfo {
	base?: string;
	seed?: string;
	nonceAccount?: string;
	nonceAuthority?: string;
	recentBlockhashesSysvar?: string;
	destination?: string;
	lamports?: number;
	source?: string;
	amount?: number;
	authority?: string;
	systemProgram?: string;
	tokenProgram?: string;
	wallet?: string;
	extensionTypes?: string[];
	mint?: string;
	newAccount?: string;
	owner?: string;
	space?: number;
	account?: string;
	rentSysvar?: string;
	tokenAmount?: {
		amount?: string;
		decimals?: number;
		uiAmount?: number;
		uiAmountString?: string;
	};
}

interface MetaData {
	err: any;
	status: any;
	fee: number;
	preBalances: number[];
	postBalances: number[];
	innerInstructions: InnerInstruction[];
	logMessages: string[];
	preTokenBalances: TokenBalance[];
	postTokenBalances: TokenBalance[];
	rewards: any;
	computeUnitsConsumed: number;
}

interface InnerInstruction {
	index: number;
	instructions: InnerInstructionDetail[];
}

interface InnerInstructionDetail {
	programId: string;
	accounts?: string[];
	data?: string;
	stackHeight: number;
	program?: string;
	parsed?: ParsedInstruction;
}

interface TokenBalance {
	accountIndex: number;
	mint: string;
	uiTokenAmount: UiTokenAmount;
	owner: string;
	programId: string;
}

interface UiTokenAmount {
	uiAmount: number;
	decimals: number;
	amount: string;
	uiAmountString: string;
}
