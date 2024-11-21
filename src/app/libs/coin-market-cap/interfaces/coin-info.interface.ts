export interface ICoinInfo {
	"id": string;
	"name": string;
	"symbol": string;
	"category": string;
	"description": string;
	"slug": string;
	"logo": string;
	"subreddit": string;
	"notice": string;
	"tags": string[];
	"tag-names": string[];
	"tag-groups": string[];
	"urls": {
		website: [];
		twitter: [];
		message_board: [];
		chat: [];
		facebook: [];
		explorer: [];
		reddit: [];
		technical_doc: [];
		source_code: [];
		announcement: [];
	};
	"platform": {
		id: string;
		name: string;
		slug: string;
		symbol: string;
		token_address: string;
	};
	"date_added": string;
	"twitter_username": string;
	"is_hidden": 0 | 1;
	"date_launched": string;
	"contract_address": [[Object]];
	"self_reported_circulating_supply": number;
	"self_reported_tags": null;
	"self_reported_market_cap": number;
	"infinite_supply": boolean;
}
