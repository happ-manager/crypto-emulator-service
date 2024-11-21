import { DEX_TOOLS_PERIODS } from "../../../libs/dex-tools/constant/dex-tools-periods.constant";

export const CHAIN_QUERY = {
	name: "chain",
	required: false,
	type: String,
	description: "Сеть",
	example: "solana"
};

export const PERIOD_QUERY = {
	name: "period",
	required: false,
	type: String,
	description: "Промежуток",
	enum: Object.values(DEX_TOOLS_PERIODS), // Указываем допустимые значения
	example: Object.values(DEX_TOOLS_PERIODS)[0] // Пример значения
};

export const DATE_QUERY = {
	name: "date",
	required: false,
	type: String,
	description: "Дата формата YYYY-MM-DDTHH:mm:ssZ",
	example: "2024-10-25T21:00:00Z"
};

export const BEFORE_DATE_QUERY = {
	...DATE_QUERY,
	name: "beforeDate",
	description: "Дата формата YYYY-MM-DDTHH:mm:ssZ. По которую будут получены данные"
};

export const AFTER_DATE_QUERY = {
	...DATE_QUERY,
	name: "afterDate",
	description: "Дата формата YYYY-MM-DDTHH:mm:ssZ. После которой будут получены данные"
};

export const UNIX_QUERY = {
	name: "unix",
	required: false,
	type: String,
	description: "Дата формата unix",
	example: "1730149200"
};

export const SKIP_QUERY = {
	name: "skip",
	required: false,
	type: Number,
	description: "Number of transactions to skip",
	example: 0
};

export const TAKE_QUERY = {
	name: "take",
	required: false,
	type: Number,
	description: "Number of transactions to take",
	example: 1
};
