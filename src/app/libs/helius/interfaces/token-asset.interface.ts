export interface ITokenAsset {
	interface: string;
	id: string;
	content: {
		$schema: string;
		json_uri: string;
		files: Object[][];
		metadata: {
			description: string;
			name: string;
			symbol: string;
			token_standard: string;
		};
		links: {
			image: string;
		};
	};
	authorities: {
		address: string;
		scopes: any[][];
	}[];
	compression: {
		eligible: boolean;
		compressed: boolean;
		data_hash: string;
		creator_hash: string;
		asset_hash: string;
		tree: string;
		seq: number;
		leaf_id: number;
	};
	grouping: [];
	royalty: {
		royalty_model: string;
		target: null;
		percent: number;
		basis_points: number;
		primary_sale_happened: boolean;
		locked: boolean;
	};
	creators: [];
	ownership: {
		frozen: boolean;
		delegated: boolean;
		delegate: null;
		ownership_model: string;
		owner: string;
	};
	supply: null;
	mutable: boolean;
	burnt: boolean;
	token_info: {
		symbol: string;
		supply: number;
		decimals: number;
		token_program: string;
		price_info: { price_per_token: number; currency: string };
	};
}
