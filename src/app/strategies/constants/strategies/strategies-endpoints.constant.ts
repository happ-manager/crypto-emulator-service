import { DYNAMIC_ID } from "../../../shared/constants/dyanmic-id.constant";
import { STRATEGIES } from "./strategies.constant";

export const STRATEGIES_ENDPOINTS = {
	BASE: STRATEGIES,
	GET_STRATEGIES: "",
	GET_STRATEGY: `${DYNAMIC_ID}`,
	CREATE_STRATEGY: "",
	UPDATE_STRATEGY: `${DYNAMIC_ID}`,
	DELETE_STRATEGY: `${DYNAMIC_ID}`,
	RECREATE_STRATEGY: `${DYNAMIC_ID}/recreate`
};
