import { DYNAMIC_ID } from "../../shared/constants/dyanmic-id.constant";
import { TOKENS } from "./tokens.constant";

export const TOKENS_ENDPOINTS = {
	BASE: TOKENS,
	GET_TOKENS: "",
	GET_TOKEN: `${DYNAMIC_ID}`,
	CREATE_TOKEN: "",
	UPDATE_TOKEN: `${DYNAMIC_ID}`,
	DELETE_TOKEN: `${DYNAMIC_ID}`
};
