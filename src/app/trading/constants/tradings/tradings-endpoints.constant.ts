import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { TRADINGS } from "./tradings.constant";

export const TRADINGS_ENDPOINTS = {
	BASE: TRADINGS,
	GET_TRADINGS: "",
	GET_TRADING: `${DYNAMIC_ID}`,
	CREATE_TRADING: "",
	UPDATE_TRADING: `${DYNAMIC_ID}`,
	DELETE_TRADING: `${DYNAMIC_ID}`
};
