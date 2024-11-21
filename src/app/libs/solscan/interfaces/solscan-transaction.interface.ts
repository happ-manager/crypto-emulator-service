export interface ISolscanTransaction {
	block_id: number;
	block_time: number;
	trans_id: string;
	address: string;
	token_address: string;
	token_account: string;
	token_decimals: number;
	amount: string;
	pre_balance: string;
	post_balance: string;
	change_type: string;
	fee: string;
}
