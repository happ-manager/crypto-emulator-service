import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { TRADING_TOKENS } from "./tradings-tokens.constant";

export const TRADING_TOKENS_ENDPOINTS = {
	BASE: TRADING_TOKENS,
	GET_TRADING_TOKENS: "",
	GET_TRADING_TOKEN: `${DYNAMIC_ID}`,
	CREATE_TRADING_TOKEN: "",
	UPDATE_TRADING_TOKEN: `${DYNAMIC_ID}`,
	DELETE_TRADING_TOKEN: `${DYNAMIC_ID}`
};
