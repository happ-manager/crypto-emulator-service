import type { IToDate } from "../../date/interfaces/to-date.interface";

export type IDexToolPair = IToDate<Pair, "creationTime" | "firstSwapTimestamp">;

export interface IDexToolsPairEntity {
	name: string;
	data: IDexToolPair;
}

interface Pair {
	id: PairID;
	creationBlock: number;
	creationTime: string;
	creationTransaction: string;
	dextScore: DextScore;
	firstSwapTimestamp: string;
	locks: any[];
	metrics: PairMetrics;
	name: string;
	nameRef: string;
	pool: Pool;
	symbol: string;
	symbolRef: string;
	type: string;
	periodStats: PeriodStats;
	token: TokenInfo;
	price: number;
	priceTime?: string;
	price5m?: PriceMetrics;
	price1h?: PriceMetrics;
	price6h?: PriceMetrics;
	price24h?: PriceMetrics;
	price7d?: PriceMetrics;
	redirectToPool?: string;
	score?: Score;
	votes?: Votes;
	volume?: number;
	swaps?: number;
}

interface PairID {
	chain: string;
	exchange: string;
	pair: string;
	token: string;
	tokenRef: string;
}

interface Score {
	total: number;
	raw: number;
	chain: number;
	pair: number;
	liquidity: number;
	dextScore: number;
	socialsScore: number;
}

interface DextScore {
	information: number;
	holders: number;
	pool: number;
	transactions: number;
	creation: number;
	total: number;
}

interface PairMetrics {
	initialReserve: number;
	initialReserveRef: number;
	liquidity: number;
	initialLiquidity: number;
	initialLiquidityUpdatedAt: string;
	liquidityUpdatedAt: string;
	reserve: number;
	reserveRef: number;
	txCount: number;
}

interface Pool {
	tokenAccount0: string;
	tokenAccount1: string;
}

interface PeriodStats {
	"5m": PeriodDetail;
	"1h": PeriodDetail;
	"6h": PeriodDetail;
	"24h": PeriodDetail;
}

interface PeriodDetail {
	volume: Volume;
	swaps: SwapDetail;
	price: PriceDetail;
	liquidity: LiquidityDetail;
	volatility: number;
	makers: number;
	updatedAt: string;
}

interface Volume {
	total: number;
	buys: number;
	sells: number;
}

interface SwapDetail {
	total: number;
	buys: number;
	sells: number;
}

interface PriceDetail {
	usd: PriceRange;
	chain: PriceRange;
}

interface PriceRange {
	first: number;
	last: number;
	min: number;
	max: number;
	diff: number;
}

interface LiquidityDetail {
	usd: PriceRange;
}

interface PriceMetrics {
	volume: number;
	swaps: number;
	price: number;
	priceChain: number;
	buys: number;
	sells: number;
	buysVolume: number;
	sellsVolume: number;
	minPrice: number;
	minPriceChain: number;
	maxPrice: number;
	maxPriceChain: number;
	makers: number;
}

interface TokenInfo {
	id: {
		chain: string;
		token: string;
	};
	audit: Audit;
	banner: string;
	decimals: number;
	info: Info;
	links: Links;
	locks: any[];
	logo: string;
	metrics: Metrics;
	name: string;
	symbol: string;
	totalSupply: string;
	creationBlock: number;
	creationTime: string;
	deployment: Deployment;
	reprPair: ReprPair;
	disclaimers: Record<string, Disclaimer>;
	price24h: number;
	volume: number;
	swaps: number;
}

interface Audit {
	is_contract_renounced: boolean;
	dextools: Dextools;
}

interface Dextools {
	is_open_source: string;
	is_honeypot: string;
	is_mintable: string;
	is_proxy: string | null;
	slippage_modifiable: string;
	is_blacklisted: string | null;
	sell_tax: TaxInfo;
	buy_tax: TaxInfo;
	is_contract_renounced: string;
	is_potentially_scam: string;
	transfer_pausable: string | null;
	summary: Summary;
	updatedAt: string;
}

interface TaxInfo {
	min: number | null;
	max: number | null;
	status: string;
}

interface Summary {
	providers: SummaryDetails;
	review: SummaryDetails;
}

interface SummaryDetails {
	critical: any[];
	warning: any[];
	regular: string[];
}

interface Info {
	cmc: string;
	coingecko: string;
	description: string;
	dextools: boolean;
	email: string;
	extraInfo: string;
	nftCollection: string;
	ventures: boolean;
	dextoolsUpdatedAt: string;
}

interface Links {
	bitbucket: string;
	discord: string;
	facebook: string;
	github: string;
	instagram: string;
	linkedin: string;
	medium: string;
	reddit: string;
	telegram: string;
	tiktok: string;
	twitter: string;
	website: string;
	youtube: string;
}

interface Metrics {
	maxSupply: number;
	totalSupply: number;
	txCount: number;
	holdersUpdatedAt: string;
	holders: number;
	circulatingSupply: number;
	fdv: number;
}

interface Deployment {
	createdAt: string;
	createdAtBlockNumber: number;
	factory: string;
	owner: string;
	updatedAt: string;
}

interface ReprPair {
	id: PairID;
	updatedAt: string;
}

interface Disclaimer {
	type: string;
	level: string;
	title: string;
	date: string;
	lastUpdate: string;
}

interface Votes {
	_warning: number;
	downvotes: number;
	upvotes: number;
}
